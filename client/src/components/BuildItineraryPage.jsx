import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from './AppHeader'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../utils/api'
import { fallbackTripImage, formatBudgetLabel, formatCompactDate } from '../utils/trips'

const toDateTimeInputValue = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatDateRangeSummary = (startDateTime, endDateTime) => {
  if (!startDateTime || !endDateTime) {
    return 'Set the date range for this section'
  }

  return `${formatCompactDate(startDateTime)} to ${formatCompactDate(endDateTime)}`
}

const buildDraft = (section) => ({
  id: section.id,
  title: section.activity?.name || `Activity ${section.id}`,
  type: section.activity?.type || 'Activity',
  image: section.activity?.images?.[0] || fallbackTripImage,
  description: section.description || section.activity?.description || '',
  budget: section.budget ? String(section.budget) : '',
  startDateTime: toDateTimeInputValue(section.startDateTime),
  endDateTime: toDateTimeInputValue(section.endDateTime),
  tagline: section.activity?.tagLine || 'Shape this part of the trip with your own timing and notes.',
})

function ItinerarySectionCard({ draft, index, isSaving, onChange, onSave }) {
  const dateSummary = formatDateRangeSummary(draft.startDateTime, draft.endDateTime)
  const budgetSummary = draft.budget ? formatBudgetLabel(Number(draft.budget)) : 'Set a section budget'

  return (
    <article className="itinerary-section-card">
      <div className="itinerary-section-header">
        <div>
          <span className="itinerary-section-label">Section {index + 1}</span>
          <h2>{draft.title}</h2>
          <p>{draft.tagline}</p>
        </div>
        <button
          type="button"
          className="trip-action-button trip-action-button-orange itinerary-save-button"
          disabled={isSaving}
          onClick={onSave}
        >
          {isSaving ? 'Saving...' : 'Save section'}
        </button>
      </div>

      <div className="itinerary-section-content">
        <div
          className="itinerary-section-image"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.1), rgba(17,24,39,0.35)), url(${draft.image})` }}
          aria-hidden="true"
        >
          <span>{draft.type}</span>
        </div>

        <div className="itinerary-section-fields">
          <label className="itinerary-copy-field">
            <span>Section details</span>
            <textarea
              value={draft.description}
              onChange={(event) => onChange(draft.id, 'description', event.target.value)}
              placeholder="Add everything important for this section of the trip."
              rows={4}
            />
          </label>

          <div className="itinerary-meta-grid">
            <section className="itinerary-meta-card">
              <strong>Date Range</strong>
              <p>{dateSummary}</p>
              <div className="itinerary-inline-fields">
                <label>
                  <span>Start</span>
                  <input
                    type="datetime-local"
                    value={draft.startDateTime}
                    onChange={(event) => onChange(draft.id, 'startDateTime', event.target.value)}
                  />
                </label>
                <label>
                  <span>End</span>
                  <input
                    type="datetime-local"
                    value={draft.endDateTime}
                    onChange={(event) => onChange(draft.id, 'endDateTime', event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="itinerary-meta-card">
              <strong>Budget</strong>
              <p>{budgetSummary}</p>
              <label className="itinerary-budget-field">
                <span>Amount in INR</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.budget}
                  onChange={(event) => onChange(draft.id, 'budget', event.target.value)}
                  placeholder="0.00"
                />
              </label>
            </section>
          </div>
        </div>
      </div>
    </article>
  )
}

function BuildItineraryPage() {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const [sections, setSections] = useState([])
  const [savingSectionId, setSavingSectionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageMessage, setPageMessage] = useState(null)

  useEffect(() => {
    let ignore = false

    const loadSections = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_URL}/activity/trip-activity?trip_id=${tripId}`, {
          headers: getAuthHeaders(),
        })
        const payload = await readJson(response)

        if (!response.ok) {
          throw new Error(getApiErrorMessage(payload, 'Failed to load itinerary sections.'))
        }

        if (!ignore) {
          setSections(Array.isArray(payload) ? payload.map(buildDraft) : [])
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load itinerary sections.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadSections()

    return () => {
      ignore = true
    }
  }, [tripId])

  const sectionCountLabel = useMemo(() => {
    if (sections.length === 1) {
      return '1 itinerary section'
    }

    return `${sections.length} itinerary sections`
  }, [sections.length])

  const updateSection = (sectionId, field, value) => {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    )
  }

  const saveSection = async (sectionId) => {
    const section = sections.find((item) => item.id === sectionId)
    if (!section) {
      return
    }

    setSavingSectionId(sectionId)
    setError(null)
    setPageMessage(null)

    try {
      const payload = {
        description: section.description,
      }

      if (section.budget !== '') {
        payload.budget = section.budget
      }

      if (section.startDateTime) {
        payload.startDateTime = new Date(section.startDateTime).toISOString()
      }

      if (section.endDateTime) {
        payload.endDateTime = new Date(section.endDateTime).toISOString()
      }

      const response = await fetch(`${API_URL}/activity/trip-activity/${sectionId}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      })
      const responsePayload = await readJson(response)

      if (!response.ok) {
        throw new Error(getApiErrorMessage(responsePayload, 'Failed to save this section.'))
      }

      setSections((currentSections) =>
        currentSections.map((item) =>
          item.id === sectionId ? buildDraft(responsePayload) : item,
        ),
      )
      setPageMessage(`Section ${sections.findIndex((item) => item.id === sectionId) + 1} saved.`)
    } catch (requestError) {
      setError(requestError.message || 'Failed to save this section.')
    } finally {
      setSavingSectionId(null)
    }
  }

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Build itinerary page">
        <AppHeader onHomeClick={() => navigate('/home')} />

        <div className="itinerary-page">
          <div className="itinerary-hero">
            <div>
              <span className="itinerary-kicker">Build itinerary</span>
              <h1>Shape the trip one section at a time</h1>
              <p>
                Adjust timing, budget, and notes for each activity section.
                Everything here maps directly to your saved trip activities.
              </p>
            </div>
            <div className="itinerary-summary-card">
              <div className="itinerary-summary-copy">
                <strong>Trip #{tripId}</strong>
                <span>{sectionCountLabel}</span>
              </div>
              <div className="itinerary-summary-actions">
                <button
                  type="button"
                  className="trip-action-button trip-action-button-soft-orange"
                  onClick={() => navigate(`/trip/${tripId}/checklist`)}
                >
                  Packing Checklist
                </button>
                <button
                  type="button"
                  className="trip-action-button trip-action-button-soft-orange"
                  onClick={() => navigate(`/trip/${tripId}/invoice`)}
                >
                  View Invoice
                </button>
              </div>
            </div>
          </div>

          {error && <p className="empty-row">{error}</p>}
          {pageMessage && <p className="empty-row itinerary-success">{pageMessage}</p>}

          {loading ? (
            <p className="empty-row">Loading itinerary sections...</p>
          ) : sections.length > 0 ? (
            <div className="itinerary-sections">
              {sections.map((section, index) => (
                <ItinerarySectionCard
                  key={section.id}
                  draft={section}
                  index={index}
                  isSaving={savingSectionId === section.id}
                  onChange={updateSection}
                  onSave={() => saveSection(section.id)}
                />
              ))}
            </div>
          ) : (
            <p className="empty-row">
              No itinerary sections are available for this trip yet.
            </p>
          )}

          <div className="itinerary-footer">
            <button
              type="button"
              className="itinerary-add-button"
              onClick={() =>
                setPageMessage(
                  'New sections are currently created from the activities you choose during trip creation.',
                )
              }
            >
              <span aria-hidden="true" />
              Add another section
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default BuildItineraryPage
