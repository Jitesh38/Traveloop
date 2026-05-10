import { useMemo, useState } from 'react'

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

const formatDate = (date) => {
  if (!date) {
    return ''
  }

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${date.getFullYear()}`
}

const isSameDay = (date, selectedDate) =>
  selectedDate &&
  date.getFullYear() === selectedDate.getFullYear() &&
  date.getMonth() === selectedDate.getMonth() &&
  date.getDate() === selectedDate.getDate()

const getCalendarDays = (visibleDate) => {
  const year = visibleDate.getFullYear()
  const month = visibleDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(year, month, 1 - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return date
  })
}

function DatePickerField({ id, isOpen, value, onChange, onOpenChange }) {
  const [visibleDate, setVisibleDate] = useState(value ?? new Date())
  const calendarDays = useMemo(() => getCalendarDays(visibleDate), [visibleDate])

  const moveMonth = (direction) => {
    setVisibleDate(new Date(visibleDate.getFullYear(), visibleDate.getMonth() + direction, 1))
  }

  const selectDate = (date) => {
    onChange(date)
    setVisibleDate(date)
    onOpenChange(null)
  }

  return (
    <div className="custom-date-picker">
      <button
        className={isOpen ? 'date-trigger active' : 'date-trigger'}
        type="button"
        id={id}
        aria-expanded={isOpen}
        onClick={() => onOpenChange(isOpen ? null : id)}
      >
        <span>{formatDate(value) || 'Select date'}</span>
      </button>

      {isOpen && (
        <div className="calendar-popover" role="dialog" aria-label="Choose date">
          <div className="calendar-header">
            <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>
              ‹
            </button>
            <strong>{monthFormatter.format(visibleDate)}</strong>
            <button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>
              ›
            </button>
          </div>

          <div className="calendar-weekdays">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date) => {
              const isMuted = date.getMonth() !== visibleDate.getMonth()
              const isSelected = isSameDay(date, value)

              return (
                <button
                  className={[
                    'calendar-day',
                    isMuted ? 'muted' : '',
                    isSelected ? 'selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  type="button"
                  key={date.toISOString()}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePickerField
