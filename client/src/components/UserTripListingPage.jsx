import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from './AppHeader'
import SectionHeader from './SectionHeader'
import UserTripListItem from './UserTripListItem'
import { API_URL, getAuthHeaders, readJson } from '../utils/api'
import { mapTripToCard } from '../utils/trips'
import { defaultTripFilters, filterItems, getGroupedTitle } from '../utils/tripFilters'
import { getToken } from '../utils/auth'

function UserTripListingPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultTripFilters)
  const [tripGroups, setTripGroups] = useState({ ongoing: [], previous: [], planned: [] })
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setError('Please log in to view your trips.')
      setLoadingTrips(false)
      return
    }

    let ignore = false

    const loadTrips = async () => {
      setLoadingTrips(true)
      setError(null)

      try {
        const response = await fetch(`${API_URL}/activity/my-trips`, {
          headers: getAuthHeaders(),
        })
        const payload = await readJson(response)

        if (!response.ok) {
          throw new Error(payload?.message || 'Failed to load your trips.')
        }

        if (!ignore) {
          setTripGroups({
            ongoing: Array.isArray(payload?.ongoing) ? payload.ongoing : [],
            previous: Array.isArray(payload?.previous) ? payload.previous : [],
            planned: Array.isArray(payload?.planned) ? payload.planned : [],
          })
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load your trips.')
        }
      } finally {
        if (!ignore) {
          setLoadingTrips(false)
        }
      }
    }

    loadTrips()

    return () => {
      ignore = true
    }
  }, [])

  const ongoingTrips = useMemo(
    () => filterItems(tripGroups.ongoing.map((trip) => mapTripToCard(trip, 'ongoing')), filters),
    [filters, tripGroups.ongoing],
  )
  const upcomingTrips = useMemo(
    () => filterItems(tripGroups.planned.map((trip) => mapTripToCard(trip, 'planned')), filters),
    [filters, tripGroups.planned],
  )
  const completedTrips = useMemo(
    () => filterItems(tripGroups.previous.map((trip) => mapTripToCard(trip, 'previous')), filters),
    [filters, tripGroups.previous],
  )

  const openTrip = (trip) => {
    if (trip.tripId) {
      navigate(`/trip/${trip.tripId}/itinerary-view`)
    }
  }

  const renderTripSection = (title, trips) => (
    <section className="user-trip-group" aria-label={title}>
      <SectionHeader title={getGroupedTitle(title, trips, filters.groupBy)} />
      {trips.length > 0 ? (
        <div className="user-trip-list">
          {trips.map((trip) => (
            <UserTripListItem key={trip.id} trip={trip} onView={openTrip} />
          ))}
        </div>
      ) : (
        <p className="empty-row">No trips match the current filters.</p>
      )}
    </section>
  )

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="User trip listing page">
        <AppHeader onHomeClick={() => navigate('/home')} />

        <div className="trip-listing-page">
          <div className="trip-listing-hero">
            <div>
              <span className="itinerary-kicker">Trip library</span>
              <h1>All your trips in one place</h1>
              <p>Browse ongoing, upcoming, and completed journeys with quick access to each itinerary.</p>
            </div>
          </div>

          {/* <LandingToolbar filters={filters} onFiltersChange={setFilters} /> */}

          {error && <p className="empty-row">{error}</p>}
          {loadingTrips ? (
            <p className="empty-row">Loading your trips...</p>
          ) : (
            <div className="user-trip-groups">
              {renderTripSection('Ongoing', ongoingTrips)}
              {renderTripSection('Upcoming', upcomingTrips)}
              {renderTripSection('Completed', completedTrips)}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default UserTripListingPage
