import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../AppHeader'
import AdminNav from './AdminNav'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../../utils/api'

function StatPill({ label, value, accent }) {
  return (
    <div className="admin-detail-stat" style={{ borderTopColor: accent }}>
      <p className="admin-stat-value" style={{ fontSize: '2rem' }}>{value}</p>
      <p className="admin-stat-label">{label}</p>
    </div>
  )
}

function AdminUserDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [toggling,    setToggling]    = useState(false)
  const [flashMsg,    setFlashMsg]    = useState(null)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/admin/users/${id}`, {
          headers: getAuthHeaders(),
        })
        const payload = await readJson(res)
        if (!res.ok) throw new Error(getApiErrorMessage(payload, 'Failed to load user.'))
        if (!ignore) setUser(payload)
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load user.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => { ignore = true }
  }, [id])

  const handleToggle = async () => {
    if (!user) return
    setToggling(true)
    setFlashMsg(null)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const payload = await readJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(payload, 'Failed to update status.'))
      setUser((prev) => ({ ...prev, isActive: payload.isActive }))
      setFlashMsg(payload.message)
    } catch (err) {
      setError(err.message || 'Failed to update status.')
    } finally {
      setToggling(false)
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const formatShort = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Admin user detail">
        <AppHeader onHomeClick={() => navigate('/home')} />
        <AdminNav />

        <div className="admin-content">
          <button
            type="button"
            className="invoice-back-link"
            style={{ marginBottom: 20 }}
            onClick={() => navigate('/admin/users')}
          >
            <span aria-hidden="true">←</span> back to Users
          </button>

          {error    && <p className="empty-row">{error}</p>}
          {flashMsg && <p className="empty-row itinerary-success">{flashMsg}</p>}

          {loading ? (
            <p className="empty-row">Loading user...</p>
          ) : user ? (
            <>
              {/* ── Profile card ── */}
              <div className="admin-section-card admin-profile-card">
                <div className="admin-profile-inner">
                  {/* Avatar */}
                  <div className="admin-profile-avatar-wrap">
                    {user.pictureUrl ? (
                      <img src={user.pictureUrl} alt={`${user.firstName} ${user.lastName}`} className="admin-profile-avatar-img" />
                    ) : (
                      <div className="admin-profile-avatar-placeholder">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                    <span className={`admin-status-badge ${user.isActive ? 'admin-status-active' : 'admin-status-inactive'}`} style={{ marginTop: 10 }}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="admin-profile-info">
                    <div className="admin-profile-header">
                      <div>
                        <h2 className="admin-profile-name">{user.firstName} {user.lastName}</h2>
                        <p className="admin-profile-email">{user.email}</p>
                      </div>
                      <span className={`admin-role-badge ${user.role === 'admin' ? 'admin-role-admin' : 'admin-role-user'}`} style={{ alignSelf: 'flex-start' }}>
                        {user.role}
                      </span>
                    </div>

                    <div className="admin-profile-meta-grid">
                      {user.phone && (
                        <div>
                          <p className="invoice-meta-label">Phone</p>
                          <p className="invoice-meta-value">{user.phone}</p>
                        </div>
                      )}
                      {(user.city || user.country) && (
                        <div>
                          <p className="invoice-meta-label">Location</p>
                          <p className="invoice-meta-value">
                            {[user.city, user.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="invoice-meta-label">Member Since</p>
                        <p className="invoice-meta-value">{formatDate(user.createdAt)}</p>
                      </div>
                      <div>
                        <p className="invoice-meta-label">User ID</p>
                        <p className="invoice-meta-value admin-id-text">{user.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="admin-profile-actions">
                    <button
                      type="button"
                      className={`trip-action-button ${user.isActive ? 'trip-action-button-soft-orange' : 'trip-action-button-orange'}`}
                      disabled={toggling}
                      onClick={handleToggle}
                    >
                      {toggling ? 'Updating…' : user.isActive ? 'Disable Account' : 'Enable Account'}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Stat pills ── */}
              <div className="admin-detail-stats-row">
                <StatPill label="Total Trips"   value={user.stats.tripCount}     accent="#ff6846" />
                <StatPill label="Paid Trips"    value={user.stats.paidTripCount} accent="#22c55e" />
                <StatPill label="Reviews Left"  value={user.stats.reviewCount}   accent="#20a9f3" />
              </div>

              {/* ── Recent trips ── */}
              <div className="admin-section-card" style={{ overflow: 'hidden' }}>
                <div className="admin-section-head">
                  <h3 className="admin-section-title">Recent Trips</h3>
                  <span className="admin-muted-cell" style={{ fontSize: '0.85rem' }}>
                    Last {user.recentTrips.length} trip{user.recentTrips.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Trip</th>
                        <th>Region</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Payment</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.recentTrips.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="admin-table-empty">No trips yet.</td>
                        </tr>
                      ) : user.recentTrips.map((trip) => (
                        <tr key={trip.id}>
                          <td>
                            <p className="admin-user-name">{trip.name || `Trip #${trip.id}`}</p>
                          </td>
                          <td className="admin-muted-cell">{trip.region?.name || '—'}</td>
                          <td className="admin-muted-cell">{formatShort(trip.startDate)}</td>
                          <td className="admin-muted-cell">{formatShort(trip.endDate)}</td>
                          <td>
                            <span className={`admin-status-badge ${trip.isPaid ? 'admin-status-active' : 'admin-status-inactive'}`}>
                              {trip.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="admin-muted-cell">{formatShort(trip.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default AdminUserDetail
