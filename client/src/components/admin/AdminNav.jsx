import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users',     path: '/admin/users' },
]

function AdminNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (path) =>
    path === '/admin' ? pathname === '/admin' : pathname.startsWith(path)

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      <div className="admin-nav-inner">
        <span className="admin-nav-label">Admin Panel</span>
        <div className="admin-nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              type="button"
              className={`admin-tab ${isActive(tab.path) ? 'admin-tab-active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default AdminNav
