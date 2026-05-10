import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import {
  AppHeader,
  Banner,
  CreateTripPage,
  LandingToolbar,
  PlanTripButton,
  SectionHeader,
  TripRow,
  TripCard,
} from './components'
import { getToken } from './utils/auth'

const API_URL = 'http://localhost:3000'

const defaultFilters = {
  search: '',
  groupBy: 'none',
  budget: 'all',
  sortBy: 'recommended',
}

const fallbackRegionImages = {
  'Paris, France':
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
  'Bali, Indonesia':
    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=900&q=80',
  'Tokyo, Japan':
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  'New York, USA':
    'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=80',
  'Santorini, Greece':
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80',
  'Nairobi, Kenya':
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80',
  'Barcelona, Spain':
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80',
  Maldives:
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80',
  'Rajasthan, India':
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
  'Patagonia, Chile':
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80',
  'Rome, Italy':
    'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=900&q=80',
  'Dubai, UAE':
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
}

const fallbackTripImage =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'

const getBudgetValue = (item) => {
  const numericValue = Number(item.price?.replace(/\D/g, ''))
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

const formatCompactDate = (value) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value))

const formatDateRange = (startDate, endDate) =>
  `${formatCompactDate(startDate)} - ${formatCompactDate(endDate)}`

const getDurationDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffInMs = end.getTime() - start.getTime()
  return Math.max(1, Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1)
}

const getRegionImage = (region) =>
  region.images?.[0] || fallbackRegionImages[region.name] || fallbackTripImage

const getTripImage = (trip) =>
  trip.tripActivities?.find((item) => item.activity?.images?.[0])?.activity?.images?.[0] ||
  trip.region?.images?.[0] ||
  fallbackRegionImages[trip.region?.name] ||
  fallbackTripImage

const formatBudgetLabel = (amount) => `Rs ${Math.round(amount).toLocaleString('en-IN')}`

const mapRegionToCard = (region) => ({
  id: `region-${region.id}`,
  title: region.name,
  subtitle: region.description || 'Explore curated activities, local highlights, and trip ideas.',
  meta: region.rating ? `Rated ${Number(region.rating).toFixed(1)} by travelers` : 'Region guide',
  rating: region.rating ? Number(region.rating).toFixed(1) : '',
  location: region.name.split(',').slice(-1)[0]?.trim() || 'Region',
  price: '',
  image: getRegionImage(region),
})

const mapTripToCard = (trip, timeline) => {
  const totalBudget = trip.tripActivities?.reduce((sum, item) => {
    const activityBudget = Number(item.budget)
    return Number.isFinite(activityBudget) ? sum + activityBudget : sum
  }, 0) ?? 0
  const hasBudget = totalBudget > 0
  const activityCount = trip.tripActivities?.length ?? 0
  const durationDays = getDurationDays(trip.startDate, trip.endDate)

  let meta = `${formatDateRange(trip.startDate, trip.endDate)}`
  if (timeline === 'planned') meta = `Starts ${formatCompactDate(trip.startDate)}`
  if (timeline === 'previous') meta = `Completed ${formatCompactDate(trip.endDate)}`
  if (timeline === 'ongoing') meta = `In progress until ${formatCompactDate(trip.endDate)}`
  if (hasBudget) meta = `${meta} - Budget ${formatBudgetLabel(totalBudget)}`

  const averageRating = activityCount
    ? trip.tripActivities.reduce((sum, item) => sum + Number(item.activity?.rating || 0), 0) / activityCount
    : 0

  return {
    id: `trip-${trip.id}`,
    title: trip.name || trip.region?.name || 'Untitled trip',
    subtitle: `${durationDays} day${durationDays > 1 ? 's' : ''}, ${activityCount} planned activit${activityCount === 1 ? 'y' : 'ies'}.`,
    meta,
    rating: averageRating > 0 ? averageRating.toFixed(1) : '',
    location: trip.region?.name || '',
    price: hasBudget ? formatBudgetLabel(totalBudget) : '',
    image: getTripImage(trip),
  }
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
  const [activeScreen, setActiveScreen] = useState('home')
  const [filters, setFilters] = useState(defaultFilters)
  const [regions, setRegions] = useState([])
  const [tripGroups, setTripGroups] = useState({ ongoing: [], previous: [], planned: [] })
  const [loadingHome, setLoadingHome] = useState(true)
  const [homeError, setHomeError] = useState(null)
  const [tripsError, setTripsError] = useState(null)

  useEffect(() => {
    if (activeScreen !== 'home') {
      return
    }

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
        const headers = { Authorization: `Bearer ${token}` }
        const [regionsRes, tripsRes] = await Promise.allSettled([
          fetch(`${API_URL}/activity/regions`, { headers }),
          fetch(`${API_URL}/activity/my-trips`, { headers }),
        ])

        if (regionsRes.status !== 'fulfilled') {
          throw new Error('Failed to load regions from the backend.')
        }

        if (!regionsRes.value.ok) {
          throw new Error('Failed to load regions from the backend.')
        }

        const regionsData = await regionsRes.value.json()

        if (ignore) {
          return
        }

        setRegions(Array.isArray(regionsData) ? regionsData : [])

        if (tripsRes.status === 'fulfilled' && tripsRes.value.ok) {
          const tripsData = await tripsRes.value.json()

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
  }, [activeScreen])

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

  if (activeScreen === 'create-trip') {
    return (
      <main className="app-shell">
        <section className="landing-page" aria-label="Create a new trip">
          <CreateTripPage onHomeClick={() => setActiveScreen('home')} />
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Traveloop landing page">
        <AppHeader onHomeClick={() => setActiveScreen('home')} />

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
                />
              )}
              <TripRow
                title={getGroupedTitle('Upcoming Trips', filteredUpcomingTrips, filters.groupBy)}
                trips={filteredUpcomingTrips}
              />
              <TripRow
                title={getGroupedTitle('Previous Trips', filteredPreviousTrips, filters.groupBy)}
                trips={filteredPreviousTrips}
              />
            </div>
          ) : null}
        </div>

        <PlanTripButton onClick={() => setActiveScreen('create-trip')} />
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home"     element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
