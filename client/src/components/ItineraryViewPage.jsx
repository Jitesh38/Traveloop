import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from './AppHeader'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../utils/api'
import { fallbackTripImage, formatBudgetLabel, formatCompactDate } from '../utils/trips'

const getDateKey = (value) => {
  if (!value) {
    return 'unscheduled'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'unscheduled'
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDayLabel = (value, index) => {
  if (value === 'unscheduled') {
    return `Day ${index + 1}`
  }

  return `Day ${index + 1}`
}

const formatReadableDate = (value) => {
  if (value === 'unscheduled') {
    return 'Date to be scheduled'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

const formatTimeRange = (startDateTime, endDateTime) => {
  if (!startDateTime || !endDateTime) {
    return 'Time to be confirmed'
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${formatter.format(new Date(startDateTime))} - ${formatter.format(new Date(endDateTime))}`
}

function ItineraryViewPage() {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const loadItinerary = async () => {
      setLoading(true)
      setError(null)

      try {
        const headers = getAuthHeaders()
        const [tripActivitiesResponse, tripsResponse] = await Promise.all([
          fetch(`${API_URL}/activity/trip-activity?trip_id=${tripId}`, { headers }),
          fetch(`${API_URL}/activity/my-trips`, { headers }),
        ])

        const [tripActivitiesPayload, tripsPayload] = await Promise.all([
          readJson(tripActivitiesResponse),
          readJson(tripsResponse),
        ])

        if (!tripActivitiesResponse.ok) {
          throw new Error(getApiErrorMessage(tripActivitiesPayload, 'Failed to load trip itinerary.'))
        }

        if (!tripsResponse.ok) {
          throw new Error(getApiErrorMessage(tripsPayload, 'Failed to load trip details.'))
        }

        const allTrips = [
          ...(Array.isArray(tripsPayload?.ongoing) ? tripsPayload.ongoing : []),
          ...(Array.isArray(tripsPayload?.planned) ? tripsPayload.planned : []),
          ...(Array.isArray(tripsPayload?.previous) ? tripsPayload.previous : []),
        ]

        const currentTrip = allTrips.find((item) => String(item.id) === String(tripId)) || null

        if (!ignore) {
          setTrip(currentTrip)
          setActivities(Array.isArray(tripActivitiesPayload) ? tripActivitiesPayload : [])
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load trip itinerary.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadItinerary()

    return () => {
      ignore = true
    }
  }, [tripId])

  const groupedDays = useMemo(() => {
    const sortedActivities = [...activities].sort((left, right) => {
      if (left.startDateTime && right.startDateTime) {
        return new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime()
      }

      if (left.startDateTime) {
        return -1
      }

      if (right.startDateTime) {
        return 1
      }

      return left.id - right.id
    })

    const groups = new Map()

    sortedActivities.forEach((activity) => {
      const key = getDateKey(activity.startDateTime)
      const existing = groups.get(key) || []
      existing.push(activity)
      groups.set(key, existing)
    })

    return [...groups.entries()].map(([key, items], index) => ({
      key,
      label: formatDayLabel(key, index),
      dateLabel: formatReadableDate(key),
      items,
    }))
  }, [activities])

  const totalBudget = useMemo(
    () =>
      activities.reduce((sum, item) => {
        const budget = Number(item.budget)
        return Number.isFinite(budget) ? sum + budget : sum
      }, 0),
    [activities],
  )

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Itinerary view page">
        <AppHeader onHomeClick={() => navigate('/home')} />

        <div className="itinerary-view-page">
          <div className="itinerary-view-hero">
            <div>
              <span className="itinerary-kicker">Itinerary view</span>
              <h1>{trip?.name || 'Itinerary for a selected place'}</h1>
              <p>
                {trip?.region?.name || trip?.regionName || 'Selected place'}
                {trip?.startDate && trip?.endDate
                  ? ` • ${formatCompactDate(trip.startDate)} to ${formatCompactDate(trip.endDate)}`
                  : ''}
              </p>
            </div>

            <div className="itinerary-view-side">
              <button
                type="button"
                className="trip-action-button trip-action-button-orange itinerary-view-edit-button"
                onClick={() => navigate(`/trip/${tripId}/itinerary`)}
              >
                Edit itinerary
              </button>

              <div className="itinerary-summary-card">
              <strong>{groupedDays.length} day plan</strong>
              <span>
                {totalBudget > 0 ? formatBudgetLabel(totalBudget) : 'Budget to be finalized'}
              </span>
              </div>
            </div>
          </div>

          {error && <p className="empty-row">{error}</p>}

          {loading ? (
            <p className="empty-row">Loading itinerary view...</p>
          ) : groupedDays.length > 0 ? (
            <div className="itinerary-day-groups">
              {groupedDays.map((day) => (
                <section className="itinerary-day-group" key={day.key}>
                  <div className="itinerary-day-badge-wrap">
                    <div className="itinerary-day-badge">{day.label}</div>
                    <span>{day.dateLabel}</span>
                  </div>

                  <div className="itinerary-day-content">
                    <div className="itinerary-day-header">
                      <span>Physical Activity</span>
                      <span>Expense</span>
                    </div>

                    <div className="itinerary-timeline">
                      {day.items.map((item, index) => {
                        const budget = Number(item.budget)
                        const hasBudget = Number.isFinite(budget) && budget > 0

                        return (
                          <div className="itinerary-timeline-row" key={item.id}>
                            <div className="itinerary-activity-card">
                              <div
                                className="itinerary-activity-thumb"
                                style={{ backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.08), rgba(17,24,39,0.32)), url(${item.activity?.images?.[0] || fallbackTripImage})` }}
                                aria-hidden="true"
                              />
                              <div className="itinerary-activity-copy">
                                <h3>{item.activity?.name || `Activity ${item.id}`}</h3>
                                <p>{item.description || item.activity?.tagLine || 'Details coming soon.'}</p>
                                <span>{formatTimeRange(item.startDateTime, item.endDateTime)}</span>
                              </div>
                            </div>

                            <div className="itinerary-expense-card">
                              {hasBudget ? formatBudgetLabel(budget) : 'Pending'}
                            </div>

                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="empty-row">No itinerary activities are available for this trip yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}

export default ItineraryViewPage
