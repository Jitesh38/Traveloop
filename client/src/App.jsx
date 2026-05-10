import { useMemo, useState } from 'react'
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
import { previousTrips, regionalSelections, upcomingTrips } from './data/travel'

const defaultFilters = {
  search: '',
  groupBy: 'none',
  budget: 'all',
  sortBy: 'recommended',
}

const getBudgetValue = (item) => Number(item.price?.replace(/\D/g, '') || 0)

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

  if (sortBy === 'budget-low') {
    return sortedItems.sort((a, b) => getBudgetValue(a) - getBudgetValue(b))
  }

  if (sortBy === 'budget-high') {
    return sortedItems.sort((a, b) => getBudgetValue(b) - getBudgetValue(a))
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

  const filteredRegions = useMemo(
    () => filterItems(regionalSelections, filters),
    [filters],
  )
  const filteredUpcomingTrips = useMemo(
    () => filterItems(upcomingTrips, filters),
    [filters],
  )
  const filteredPreviousTrips = useMemo(
    () => filterItems(previousTrips, filters),
    [filters],
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

          <SectionHeader title="Top Regional Selections" />
          {filteredRegions.length > 0 ? (
            <div className="regional-grid" aria-label="Popular cities and recommended destinations">
              {filteredRegions.map((region) => (
                <TripCard key={region.id} item={region} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="empty-row">No destinations match the current filters.</p>
          )}

          <SectionHeader title="Your Trips" />
          <div className="your-trips" aria-label="Your trips">
            <TripRow
              title={getGroupedTitle('Upcoming Trips', filteredUpcomingTrips, filters.groupBy)}
              trips={filteredUpcomingTrips}
            />
            <TripRow
              title={getGroupedTitle('Previous Trips', filteredPreviousTrips, filters.groupBy)}
              trips={filteredPreviousTrips}
            />
          </div>
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
