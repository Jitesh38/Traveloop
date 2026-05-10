import { useNavigate } from 'react-router-dom'
import { clearSession, getUser } from '../utils/auth'

function AppHeader({ onHomeClick }) {
  const navigate = useNavigate()
  const user = getUser()

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
        {user?.role === 'admin' && (
          <a
            href="/admin"
            className="admin-header-link"
            onClick={(e) => { e.preventDefault(); navigate('/admin') }}
          >
            Admin
          </a>
        )}
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
          {user?.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Profile'}
              className="avatar-image"
            />
          ) : (
            <span className="avatar-initials">
              {(user?.firstName?.[0] ?? '').toUpperCase()}
              {(user?.lastName?.[0] ?? '').toUpperCase()}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

export default AppHeader
