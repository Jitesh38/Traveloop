function AppHeader() {
  return (
    <header className="app-header">
      <a className="brand" href="/" aria-label="Traveloop home">
        <span className="brand-mark" aria-hidden="true" />
        Traveloop
      </a>
      <button className="avatar-button" aria-label="Open profile menu" type="button">
        <span />
      </button>
    </header>
  )
}

export default AppHeader
