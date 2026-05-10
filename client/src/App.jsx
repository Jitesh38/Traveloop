import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import {
  AppHeader,
  Banner,
  BuildItineraryPage,
  CreateTripPage,
  LandingToolbar,
  PlanTripButton,
  SectionHeader,
  TripCard,
  TripRow,
} from './components'
import { API_URL, getAuthHeaders, readJson } from './utils/api'
import { getToken } from './utils/auth'
import { getBudgetValue, mapRegionToCard, mapTripToCard } from './utils/trips'

const defaultFilters = {
  search: '',
  groupBy: 'none',
  budget: 'all',
  sortBy: 'recommended',
}

const matchesSearch = (item, search) => {
  const query = search.trim().toLowerCase()

  if (!query) {
    return true
  }

  return [item.title, item.subtitle, item.meta, item.location]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query))
}

const matchesBudget = (item, budget) => {
  const value = getBudgetValue(item)

  if (budget !== 'all' && value === null) {
    return false
  }

  if (budget === 'under-10') {
    return value < 10
  }

  if (budget === '10-20') {
    return value >= 10 && value <= 20
  }

  if (budget === '20-plus') {
    return value > 20
  }

  return true
}

const sortItems = (items, sortBy) => {
  const sortedItems = [...items]
  const sortableBudget = (item, direction) => {
    const value = getBudgetValue(item)
    if (value === null) {
      return direction === 'low' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    }
    return value
  }

  if (sortBy === 'budget-low') {
    return sortedItems.sort((a, b) => sortableBudget(a, 'low') - sortableBudget(b, 'low'))
  }

  if (sortBy === 'budget-high') {
    return sortedItems.sort((a, b) => sortableBudget(b, 'high') - sortableBudget(a, 'high'))
  }

  if (sortBy === 'rating') {
    return sortedItems.sort((a, b) => Number(b.rating) - Number(a.rating))
  }

  return sortedItems
}

const filterItems = (items, filters) =>
  sortItems(
    items.filter((item) => matchesSearch(item, filters.search) && matchesBudget(item, filters.budget)),
    filters.sortBy,
  )

const getGroupedTitle = (title, items, groupBy) => {
  if (groupBy !== 'state' || items.length === 0) {
    return title
  }

  const locations = [...new Set(items.map((item) => item.location))]
  return `${title} by State (${locations.join(', ')})`
}

function HomePage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [regions, setRegions] = useState([])
  const [tripGroups, setTripGroups] = useState({ ongoing: [], previous: [], planned: [] })
  const [loadingHome, setLoadingHome] = useState(true)
  const [homeError, setHomeError] = useState(null)
  const [tripsError, setTripsError] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setHomeError('Please log in to view your trips.')
      setLoadingHome(false)
      return
    }

    let ignore = false

    const loadHome = async () => {
      setLoadingHome(true)
      setHomeError(null)
      setTripsError(null)

      try {
        const headers = getAuthHeaders()
        const [regionsRes, tripsRes] = await Promise.allSettled([
          fetch(`${API_URL}/activity/regions`, { headers }),
          fetch(`${API_URL}/activity/my-trips`, { headers }),
        ])

        if (regionsRes.status !== 'fulfilled' || !regionsRes.value.ok) {
          throw new Error('Failed to load regions from the backend.')
        }

        const regionsData = await readJson(regionsRes.value)

        if (ignore) {
          return
        }

        setRegions(Array.isArray(regionsData) ? regionsData : [])

        if (tripsRes.status === 'fulfilled' && tripsRes.value.ok) {
          const tripsData = await readJson(tripsRes.value)

          if (ignore) {
            return
          }

          setTripGroups({
            ongoing: Array.isArray(tripsData?.ongoing) ? tripsData.ongoing : [],
            previous: Array.isArray(tripsData?.previous) ? tripsData.previous : [],
            planned: Array.isArray(tripsData?.planned) ? tripsData.planned : [],
          })
        } else {
          setTripGroups({ ongoing: [], previous: [], planned: [] })
          setTripsError('Trips are unavailable right now. Your regions are still loading correctly.')
        }
      } catch (error) {
        if (!ignore) {
          setHomeError(error.message || 'Failed to load your travel dashboard.')
        }
      } finally {
        if (!ignore) {
          setLoadingHome(false)
        }
      }
    }

    loadHome()

    return () => {
      ignore = true
    }
  }, [])

  const filteredRegions = useMemo(
    () => filterItems(
      [...regions]
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        .slice(0, 8)
        .map(mapRegionToCard),
      filters,
    ),
    [filters, regions],
  )
  const filteredUpcomingTrips = useMemo(
    () => filterItems(tripGroups.planned.map((trip) => mapTripToCard(trip, 'planned')), filters),
    [filters, tripGroups.planned],
  )
  const filteredOngoingTrips = useMemo(
    () => filterItems(tripGroups.ongoing.map((trip) => mapTripToCard(trip, 'ongoing')), filters),
    [filters, tripGroups.ongoing],
  )
  const filteredPreviousTrips = useMemo(
    () => filterItems(tripGroups.previous.map((trip) => mapTripToCard(trip, 'previous')), filters),
    [filters, tripGroups.previous],
  )

  const openItinerary = (trip) => {
    if (trip.tripId) {
      navigate(`/trip/${trip.tripId}/itinerary`)
    }
  }

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Traveloop landing page">
        <AppHeader onHomeClick={() => navigate('/home')} />

        <div className="landing-content">
          <Banner />
          <LandingToolbar filters={filters} onFiltersChange={setFilters} />

          {homeError && <p className="empty-row">{homeError}</p>}
          {tripsError && <p className="empty-row">{tripsError}</p>}
          {loadingHome && <p className="empty-row">Loading your travel dashboard...</p>}

          <SectionHeader title="Top Regional Selections" />
          {!loadingHome && filteredRegions.length > 0 ? (
            <div className="regional-grid" aria-label="Popular cities and recommended destinations">
              {filteredRegions.map((region) => (
                <TripCard key={region.id} item={region} variant="compact" />
              ))}
            </div>
          ) : !loadingHome ? (
            <p className="empty-row">No destinations match the current filters.</p>
          ) : null}

          <SectionHeader title="Your Trips" />
          {!loadingHome ? (
            <div className="your-trips" aria-label="Your trips">
              {filteredOngoingTrips.length > 0 && (
                <TripRow
                  title={getGroupedTitle('Ongoing Trips', filteredOngoingTrips, filters.groupBy)}
                  trips={filteredOngoingTrips}
                  onSelectTrip={openItinerary}
                />
              )}
              <TripRow
                title={getGroupedTitle('Upcoming Trips', filteredUpcomingTrips, filters.groupBy)}
                trips={filteredUpcomingTrips}
                onSelectTrip={openItinerary}
              />
              <TripRow
                title={getGroupedTitle('Previous Trips', filteredPreviousTrips, filters.groupBy)}
                trips={filteredPreviousTrips}
                onSelectTrip={openItinerary}
              />
            </div>
          ) : null}
        </div>

        <PlanTripButton onClick={() => navigate('/trip/new')} />
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/trip/new" element={<CreateTripPage />} />
        <Route path="/trip/:tripId/itinerary" element={<BuildItineraryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
