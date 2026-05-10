function TripCard({ item, variant = 'default', onClick }) {
  const cardProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: () => onClick(item),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick(item)
          }
        },
      }
    : {}

  return (
    <article
      className={`trip-card trip-card-${variant} ${onClick ? 'trip-card-interactive' : ''}`}
      {...cardProps}
    >
      <div className="trip-image" style={{ backgroundImage: `url(${item.image})` }}>
        <div className="trip-badges">
          {item.rating && <span className="rating-badge">{item.rating}</span>}
          {item.location && <span className="location-badge">{item.location}</span>}
        </div>
      </div>
      <div className="trip-details">
        <div className="trip-title-row">
          <h3>{item.title}</h3>
          {item.price && <span>{item.price}</span>}
        </div>
        <p>{item.subtitle}</p>
        {item.meta && <span className="trip-meta">{item.meta}</span>}
      </div>
    </article>
  )
}

export default TripCard
