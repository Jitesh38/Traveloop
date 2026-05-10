function UserTripListItem({ trip, onView }) {
  return (
    <article className="user-trip-list-item">
      <div
        className="user-trip-list-thumb"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.06), rgba(17,24,39,0.34)), url(${trip.image})` }}
        aria-hidden="true"
      />

      <div className="user-trip-list-content">
        <div className="user-trip-list-head">
          <div>
            <span className="user-trip-list-kicker">{trip.location || 'Trip'}</span>
            <h3>{trip.title}</h3>
          </div>
        </div>

        <p>{trip.subtitle}</p>

        <div className="user-trip-list-meta">
          {typeof trip.activityCount === 'number' && (
            <span>
              {trip.activityCount} activit{trip.activityCount === 1 ? 'y' : 'ies'}
            </span>
          )}
          {trip.meta && <span>{trip.meta}</span>}
          {trip.price && <span>{trip.price}</span>}
        </div>
      </div>

      <div className="user-trip-list-actions">
        {trip.rating && <span className="user-trip-list-rating">{trip.rating}</span>}
        <button
          type="button"
          className="trip-action-button trip-action-button-orange"
          onClick={() => onView(trip)}
        >
          View itinerary
        </button>
      </div>
    </article>
  )
}

export default UserTripListItem
