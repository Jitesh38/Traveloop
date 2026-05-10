import TripCard from './TripCard'

function TripRow({ title, trips }) {
  return (
    <section className="trip-row" aria-label={title}>
      <h3 className="trip-row-title">{title}</h3>
      {trips.length > 0 ? (
        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} item={trip} />
          ))}
        </div>
      ) : (
        <p className="empty-row">No trips match the current filters.</p>
      )}
    </section>
  )
}

export default TripRow
