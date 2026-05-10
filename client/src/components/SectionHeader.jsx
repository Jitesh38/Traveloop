function SectionHeader({ title }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <span aria-hidden="true" />
    </div>
  )
}

export default SectionHeader
