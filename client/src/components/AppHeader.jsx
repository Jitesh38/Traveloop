import { useNavigate } from 'react-router-dom'
import { clearSession } from '../utils/auth'

function AppHeader({ onHomeClick }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <a
        className="brand"
        href="/home"
        aria-label="Traveloop home"
        onClick={(event) => {
          if (onHomeClick) {
            event.preventDefault()
            onHomeClick()
          }
        }}
      >
        <span className="brand-mark" aria-hidden="true" />
        Traveloop
      </a>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/trips')}
          className="header-nav-button"
        >
          My Trips
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
        >
          Logout
        </button>
        <button className="avatar-button" aria-label="Open profile menu" type="button">
          <span />
        </button>
      </div>
    </header>
  )
}

export default AppHeader
