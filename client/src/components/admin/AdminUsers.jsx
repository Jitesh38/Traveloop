import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../AppHeader'
import AdminNav from './AdminNav'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../../utils/api'

const PAGE_SIZE = 20

function AdminUsers() {
  const navigate = useNavigate()

  const [users,       setUsers]       = useState([])
  const [meta,        setMeta]        = useState({ total: 0, page: 1, totalPages: 1 })
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [togglingId,  setTogglingId]  = useState(null)
  const [flashMsg,    setFlashMsg]    = useState(null)

  const debounceRef = useRef(null)

  const loadUsers = useCallback(async (pg, q) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE })
      if (q) params.set('search', q)
      const res = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: getAuthHeaders(),
      })
      const payload = await readJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(payload, 'Failed to load users.'))
      setUsers(Array.isArray(payload.data) ? payload.data : [])
      setMeta(payload.meta || { total: 0, page: 1, totalPages: 1 })
    } catch (err) {
      setError(err.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers(page, search)
  }, [loadUsers, page])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadUsers(1, val)
    }, 400)
  }

  const handleToggleStatus = async (user) => {
    setTogglingId(user.id)
    setFlashMsg(null)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const payload = await readJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(payload, 'Failed to update status.'))
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: payload.isActive } : u))
      )
      setFlashMsg(payload.message)
    } catch (err) {
      setError(err.message || 'Failed to update status.')
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Admin users">
        <AppHeader onHomeClick={() => navigate('/home')} />
        <AdminNav />

        <div className="admin-content">
          {/* Toolbar */}
          <div className="admin-users-toolbar">
            <div>
              <h2 className="admin-page-title">All Users</h2>
              {!loading && (
                <p className="admin-page-sub">{meta.total} registered user{meta.total !== 1 ? 's' : ''}</p>
              )}
            </div>
            <label className="admin-search-field">
              <span className="sr-only">Search users</span>
              <svg className="admin-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search by name or email…"
                value={search}
                onChange={handleSearchChange}
              />
            </label>
          </div>

          {error    && <p className="empty-row">{error}</p>}
          {flashMsg && <p className="empty-row itinerary-success">{flashMsg}</p>}

          {/* Table */}
          <div className="admin-section-card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <p className="empty-row">Loading users...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-users-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="admin-table-empty">
                          {search ? `No users matching "${search}"` : 'No users found.'}
                        </td>
                      </tr>
                    ) : users.map((u, i) => (
                      <tr
                        key={u.id}
                        className="admin-table-row-link"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        <td className="admin-rank-cell">
                          {(meta.page - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="admin-user-name">{u.firstName} {u.lastName}</p>
                              {u.phone && <p className="admin-user-email">{u.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="admin-muted-cell">{u.email}</td>
                        <td className="admin-muted-cell">
                          {[u.city, u.country].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td>
                          <span className={`admin-role-badge ${u.role === 'admin' ? 'admin-role-admin' : 'admin-role-user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${u.isActive ? 'admin-status-active' : 'admin-status-inactive'}`}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="admin-muted-cell">{formatDate(u.createdAt)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`admin-toggle-btn ${u.isActive ? 'admin-toggle-disable' : 'admin-toggle-enable'}`}
                            disabled={togglingId === u.id}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {togglingId === u.id ? '…' : u.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="admin-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>

              <div className="admin-page-numbers">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, i) =>
                    item === '…' ? (
                      <span key={`ellipsis-${i}`} className="admin-page-ellipsis">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`admin-page-num ${item === page ? 'admin-page-num-active' : ''}`}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                type="button"
                className="admin-page-btn"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default AdminUsers
