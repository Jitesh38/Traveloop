import { useState } from 'react'
import AppHeader from './AppHeader'
import DatePickerField from './DatePickerField'
import { tripSuggestions } from '../data/travel'

const formFields = [
  { id: 'trip-name', label: 'Trip Name', placeholder: 'Weekend in Jaipur', type: 'text' },
  { id: 'place', label: 'Select a Place', placeholder: 'Search Indian city or stop', type: 'text' },
  { id: 'start-date', label: 'Start Date', type: 'date' },
  { id: 'end-date', label: 'End Date', type: 'date' },
]

function CreateTripPage({ onHomeClick }) {
  const [dates, setDates] = useState({
    'start-date': new Date(2026, 4, 10),
    'end-date': new Date(2026, 4, 12),
  })
  const [openDatePicker, setOpenDatePicker] = useState(null)

  const updateDate = (id, value) => {
    setDates((currentDates) => ({
      ...currentDates,
      [id]: value,
    }))
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

          <form className="trip-form">
            {formFields.map((field) => (
              <label className={`trip-field trip-field-${field.type}`} htmlFor={field.id} key={field.id}>
                <span>{field.label}</span>
                {field.type === 'date' ? (
                  <DatePickerField
                    id={field.id}
                    isOpen={openDatePicker === field.id}
                    value={dates[field.id]}
                    onChange={(value) => updateDate(field.id, value)}
                    onOpenChange={setOpenDatePicker}
                  />
                ) : (
                  <div className="field-control">
                    <input id={field.id} type={field.type} placeholder={field.placeholder} />
                  </div>
                )}
              </label>
            ))}
          </form>
        </section>

        <section className="suggestions-section" aria-labelledby="suggestions-title">
          <div className="suggestions-heading">
            <h2 id="suggestions-title">Suggestions for places to visit and activities</h2>
            <p>Pick ideas for your route, stays, food stops, and day plans.</p>
          </div>

          <div className="suggestion-grid">
            {tripSuggestions.map((suggestion) => (
              <article className="suggestion-card" key={suggestion.id}>
                <div className="suggestion-image" style={{ backgroundImage: `url(${suggestion.image})` }} />
                <div className="suggestion-body">
                  <span>{suggestion.category}</span>
                  <h3>{suggestion.title}</h3>
                  <p>{suggestion.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default CreateTripPage
