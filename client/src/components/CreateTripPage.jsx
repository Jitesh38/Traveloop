import { useState, useEffect } from 'react'
import AppHeader from './AppHeader'
import DatePickerField from './DatePickerField'
import { getToken } from '../utils/auth'

const API_URL = 'http://localhost:3000'

function CreateTripPage({ onHomeClick }) {
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
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
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
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to fetch activities')
      const data = await res.json()
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          name: tripName || undefined,
          regionName: selectedRegion?.name,
          startDate: formatDate(dates['start-date']),
          endDate: formatDate(dates['end-date']),
          activityIds: Array.from(selectedActivities)
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create trip')
      }
      
      onHomeClick() // Go back home on success
    } catch (err) {
      setError(err.message)
    } finally {
      setCreatingTrip(false)
    }
  }

  return (
    <>
      <AppHeader onHomeClick={onHomeClick} />

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
                className="plan-trip-button px-6 font-bold bg-[#ffe36b] border-none text-[#111827] hover:bg-[#e6cc60] shadow-md transition-colors cursor-pointer"
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
                className="plan-trip-button px-6 font-bold bg-[#20a9f3] border-none text-white hover:bg-[#148ed2] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    className={`suggestion-card cursor-pointer transition-transform hover:scale-[1.02] ${isSelected ? 'ring-4 ring-[#ff6846] rounded-[15px]' : ''}`} 
                    key={activity.id}
                    onClick={() => toggleActivity(activity.id)}
                  >
                    <div className="suggestion-image relative" style={{ backgroundImage: `url(${imageUrl})` }}>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-[#ff6846] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
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
