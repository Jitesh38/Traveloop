function PlanTripButton({ onClick }) {
  return (
    <button className="plan-trip-button floating-plan-trip-button" type="button" onClick={onClick}>
      <span aria-hidden="true" />
      Plan New Trip
    </button>
  )
}

export default PlanTripButton
