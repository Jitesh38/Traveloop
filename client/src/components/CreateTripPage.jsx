import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from './AppHeader'
import DatePickerField from './DatePickerField'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../utils/api'

function CreateTripPage({ onHomeClick }) {
  const navigate = useNavigate()
  const [tripName, setTripName] = useState('')
  const [regionId, setRegionId] = useState('')
  const [dates, setDates] = useState({
    'start-date': new Date(2026, 4, 10),
    'end-date': new Date(2026, 4, 12),
  })
  const [openDatePicker, setOpenDatePicker] = useState(null)

  const [regions, setRegions] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedActivities, setSelectedActivities] = useState(new Set())
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [creatingTrip, setCreatingTrip] = useState(false)
  const [error, setError] = useState(null)

  // Fetch regions on mount
  useEffect(() => {
    fetch(`${API_URL}/activity/regions`, {
      headers: getAuthHeaders(),
    })
      .then((res) => readJson(res))
      .then((data) => {
        if (Array.isArray(data)) setRegions(data)
      })
      .catch((err) => console.error('Failed to fetch regions:', err))
  }, [])

  const updateDate = (id, value) => {
    setDates((currentDates) => ({ ...currentDates, [id]: value }))
  }

  const handleRecommend = async (e) => {
    e.preventDefault()
    if (!regionId) return setError('Please select a place first.')
    setError(null)
    setLoadingActivities(true)
    
    try {
      const res = await fetch(`${API_URL}/activity?region_id=${regionId}`, {
        headers: getAuthHeaders(),
      })
      const data = await readJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to fetch activities'))
      setActivities(data)
      setSelectedActivities(new Set()) // Reset selection when new activities load
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingActivities(false)
    }
  }

  const toggleActivity = (id) => {
    const next = new Set(selectedActivities)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedActivities(next)
  }

  const handleCreateTrip = async () => {
    if (selectedActivities.size === 0) {
      return setError('Please select at least one activity to create a trip.')
    }
    setCreatingTrip(true)
    setError(null)
    
    // Format to YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    try {
      const selectedRegion = regions.find((region) => String(region.id) === String(regionId))

      const res = await fetch(`${API_URL}/activity/create-my-trip`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: tripName || undefined,
          regionName: selectedRegion?.name,
          startDate: formatDate(dates['start-date']),
          endDate: formatDate(dates['end-date']),
          activityIds: Array.from(selectedActivities)
        })
      })
      
      const payload = await readJson(res)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(payload, 'Failed to create trip'))
      }

      navigate(`/trip/${payload?.id}/itinerary`)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreatingTrip(false)
    }
  }

  return (
    <>
      <AppHeader onHomeClick={onHomeClick || (() => navigate('/home'))} />

      <div className="create-trip-content">
        <section className="create-trip-form-section" aria-labelledby="create-trip-title">
          <div className="create-trip-heading">
            <span>Plan a new trip</span>
            <h1 id="create-trip-title">Create a new trip</h1>
          </div>

          <form className="trip-form" onSubmit={handleRecommend}>
            {error && (
              <div className="col-span-2 mb-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm flex items-start gap-2">
                {error}
              </div>
            )}
            
            <label className="trip-field trip-field-text" htmlFor="trip-name">
              <span>Trip Name</span>
              <div className="field-control">
                <input 
                  id="trip-name" 
                  type="text" 
                  placeholder="Weekend in Jaipur" 
                  value={tripName}
                  onChange={e => setTripName(e.target.value)}
                />
              </div>
            </label>

            <label className="trip-field trip-field-text" htmlFor="place">
              <span>Select a Place</span>
              <div className="field-control">
                <select 
                  id="place"
                  className="w-full h-[46px] px-[15px] border border-[var(--line)] rounded-[9px] outline-none bg-white text-[var(--ink)] shadow-[0_10px_24px_rgba(17,24,39,0.04)] focus:border-[#8bd5fb] focus:shadow-[0_0_0_4px_rgba(32,169,243,0.12)] appearance-none"
                  value={regionId}
                  onChange={e => setRegionId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a region</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </label>

            <label className="trip-field trip-field-date" htmlFor="start-date">
              <span>Start Date</span>
              <DatePickerField
                id="start-date"
                isOpen={openDatePicker === 'start-date'}
                value={dates['start-date']}
                onChange={(value) => updateDate('start-date', value)}
                onOpenChange={setOpenDatePicker}
              />
            </label>

            <label className="trip-field trip-field-date" htmlFor="end-date">
              <span>End Date</span>
              <DatePickerField
                id="end-date"
                isOpen={openDatePicker === 'end-date'}
                value={dates['end-date']}
                onChange={(value) => updateDate('end-date', value)}
                onOpenChange={setOpenDatePicker}
              />
            </label>

            <div className="col-span-2 mt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={loadingActivities}
                className="trip-action-button trip-action-button-orange"
              >
                {loadingActivities ? 'Loading...' : 'Recommend Activities'}
              </button>
            </div>
          </form>
        </section>

        {activities.length > 0 && (
          <section className="suggestions-section mt-8" aria-labelledby="suggestions-title">
            <div className="suggestions-heading">
              <div>
                <h2 id="suggestions-title">Recommended Activities</h2>
                <p>Select the activities you want to include in your trip.</p>
              </div>
              <button 
                onClick={handleCreateTrip}
                disabled={creatingTrip || selectedActivities.size === 0}
                className="trip-action-button trip-action-button-orange"
              >
                {creatingTrip ? 'Saving...' : `Create Trip (${selectedActivities.size} selected)`}
              </button>
            </div>

            <div className="suggestion-grid">
              {activities.map((activity) => {
                const isSelected = selectedActivities.has(activity.id)
                // Use actual image or fallback
                const imageUrl = (activity.images && activity.images.length > 0) 
                  ? activity.images[0] 
                  : 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85'
                
                return (
                  <article 
                    className={`suggestion-card ${isSelected ? 'suggestion-card-selected' : ''}`}
                    key={activity.id}
                    onClick={() => toggleActivity(activity.id)}
                  >
                    <div className="suggestion-image" style={{ backgroundImage: `url(${imageUrl})` }}>
                      {isSelected && (
                        <div className="suggestion-checkmark">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="suggestion-body">
                      <span>{activity.type || 'Activity'}</span>
                      <h3>{activity.name}</h3>
                      <p>{activity.tagLine || activity.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default CreateTripPage
