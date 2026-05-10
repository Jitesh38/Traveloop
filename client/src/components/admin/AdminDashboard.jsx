import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../AppHeader'
import AdminNav from './AdminNav'
import { API_URL, getAuthHeaders, readJson } from '../../utils/api'

// ─── Charts ────────────────────────────────────────────────────────────────

function TripBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="admin-chart-empty">No trip data for the last 12 months.</div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.trips), 1)
  const barW = 28
  const gap = 12
  const paddingX = 32
  const paddingTop = 28
  const labelH = 28
  const chartH = 200
  const innerH = chartH - paddingTop - labelH
  const totalW = data.length * (barW + gap) + paddingX * 2

  const formatMonth = (yyyymm) => {
    const [y, m] = yyyymm.split('-')
    return new Date(+y, +m - 1, 1).toLocaleDateString('en-US', { month: 'short' })
  }

  const gridFracs = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg
      viewBox={`0 0 ${totalW} ${chartH}`}
      style={{ width: '100%', height: chartH, overflow: 'visible' }}
      aria-label="Trips over time bar chart"
    >
      <defs>
        <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6846" />
          <stop offset="100%" stopColor="#ffb39a" />
        </linearGradient>
      </defs>

      {gridFracs.map((f) => {
        const y = paddingTop + innerH * (1 - f)
        return (
          <g key={f}>
            <line
              x1={paddingX} x2={totalW - paddingX}
              y1={y} y2={y}
              stroke="#f0f4f8" strokeWidth={1}
            />
            <text x={paddingX - 4} y={y + 3} textAnchor="end" fontSize={9} fill="#c3cad7" fontWeight={800}>
              {Math.round(maxVal * f)}
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const barH = Math.max(3, (d.trips / maxVal) * innerH)
        const x = paddingX + i * (barW + gap)
        const y = paddingTop + innerH - barH
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={barH} rx={5} fill="url(#adminBarGrad)" />
            {d.trips > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={9} fill="#ff6846" fontWeight={900}>
                {d.trips}
              </text>
            )}
            <text x={x + barW / 2} y={chartH - 6} textAnchor="middle" fontSize={9} fill="#8894a5" fontWeight={800}>
              {formatMonth(d.month)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function RegionBars({ data }) {
  if (!data || data.length === 0) {
    return <div className="admin-chart-empty">No region data.</div>
  }
  const max = Math.max(...data.map((d) => d.trip_count), 1)
  const colors = ['#ff6846', '#ff8266', '#ff9c86', '#ffb6a6', '#ffd0c6']

  return (
    <div className="admin-hbar-list">
      {data.slice(0, 8).map((d, i) => (
        <div key={d.id} className="admin-hbar-row">
          <div className="admin-hbar-meta">
            <span className="admin-hbar-name">{d.name}</span>
            <span className="admin-hbar-count">{d.trip_count} trip{d.trip_count !== 1 ? 's' : ''}</span>
          </div>
          <div className="admin-hbar-track">
            <div
              className="admin-hbar-fill"
              style={{
                width: `${(d.trip_count / max) * 100}%`,
                background: colors[Math.min(i, colors.length - 1)],
              }}
            />
          </div>
          {d.rating && (
            <span className="admin-hbar-rating">★ {Number(d.rating).toFixed(1)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="admin-stat-card" style={{ borderTopColor: accent || '#ff6846' }}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {sub && <p className="admin-stat-sub">{sub}</p>}
    </div>
  )
}

function SectionCard({ title, children, action }) {
  return (
    <div className="admin-section-card">
      <div className="admin-section-head">
        <h3 className="admin-section-title">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate()

  const [overview,    setOverview]    = useState(null)
  const [tripsTime,   setTripsTime]   = useState([])
  const [topRegions,  setTopRegions]  = useState([])
  const [topActivities, setTopActivities] = useState([])
  const [engagement,  setEngagement]  = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const headers = getAuthHeaders()
        const results = await Promise.allSettled([
          fetch(`${API_URL}/admin/stats/overview`,       { headers }).then(readJson),
          fetch(`${API_URL}/admin/stats/trips-over-time`, { headers }).then(readJson),
          fetch(`${API_URL}/admin/stats/top-regions?limit=8`, { headers }).then(readJson),
          fetch(`${API_URL}/admin/stats/top-activities?limit=10`, { headers }).then(readJson),
          fetch(`${API_URL}/admin/stats/user-engagement`, { headers }).then(readJson),
        ])

        if (ignore) return

        if (results[0].status === 'fulfilled') setOverview(results[0].value)
        else throw new Error('Failed to load admin overview. Make sure you have admin access.')

        if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) setTripsTime(results[1].value)
        if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) setTopRegions(results[2].value)
        if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) setTopActivities(results[3].value)
        if (results[4].status === 'fulfilled') setEngagement(results[4].value)
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load dashboard.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => { ignore = true }
  }, [])

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN')
  const fmtRs = (n) => `Rs ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Admin dashboard">
        <AppHeader onHomeClick={() => navigate('/home')} />
        <AdminNav />

        <div className="admin-content">
          {error && <p className="empty-row">{error}</p>}

          {loading ? (
            <p className="empty-row">Loading dashboard...</p>
          ) : overview ? (
            <>
              {/* ── Stats overview ── */}
              <div className="admin-stats-grid">
                <StatCard label="Total Users"       value={fmt(overview.totalUsers)}       sub={`${fmt(overview.activeUsers)} active`}  accent="#20a9f3" />
                <StatCard label="Active Users"      value={fmt(overview.activeUsers)}       sub={`of ${fmt(overview.totalUsers)} registered`} accent="#20a9f3" />
                <StatCard label="Total Trips"       value={fmt(overview.totalTrips)}        sub={`${fmt(overview.paidTrips)} paid`}       accent="#ff6846" />
                <StatCard label="Paid Trips"        value={fmt(overview.paidTrips)}         sub={`${overview.totalTrips ? Math.round((overview.paidTrips / overview.totalTrips) * 100) : 0}% paid rate`} accent="#22c55e" />
                <StatCard label="Activities"        value={fmt(overview.totalActivities)}   accent="#f59e0b" />
                <StatCard label="Reviews"           value={fmt(overview.totalReviews)}      accent="#a78bfa" />
                <StatCard
                  label="Est. Revenue"
                  value={fmtRs(overview.estimatedRevenue)}
                  sub="from paid trips (incl. 5% tax)"
                  accent="#22c55e"
                />
              </div>

              {/* ── Charts row ── */}
              <div className="admin-charts-grid">
                <SectionCard title="Trips Created — Last 12 Months">
                  <div style={{ marginTop: 8 }}>
                    <TripBarChart data={tripsTime} />
                  </div>
                </SectionCard>

                <SectionCard title="Top Regions by Bookings">
                  <div style={{ marginTop: 16 }}>
                    <RegionBars data={topRegions} />
                  </div>
                </SectionCard>
              </div>

              {/* ── Bottom row ── */}
              <div className="admin-bottom-grid">
                {/* User Engagement */}
                <SectionCard title="User Engagement">
                  <div className="admin-engagement-metrics">
                    <div className="admin-metric-pill">
                      <span className="admin-metric-value">{Number(engagement?.avgTripsPerUser || 0).toFixed(1)}</span>
                      <span className="admin-metric-label">avg trips / user</span>
                    </div>
                    <div className="admin-metric-pill">
                      <span className="admin-metric-value">{Number(engagement?.avgReviewsPerUser || 0).toFixed(1)}</span>
                      <span className="admin-metric-label">avg reviews / user</span>
                    </div>
                  </div>

                  <p className="admin-sub-heading">Most Active Users</p>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Trips</th>
                          <th>Reviews</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(engagement?.mostActiveUsers || []).map((u) => (
                          <tr
                            key={u.id}
                            className="admin-table-row-link"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                          >
                            <td>
                              <p className="admin-user-name">{u.firstName} {u.lastName}</p>
                              <p className="admin-user-email">{u.email}</p>
                            </td>
                            <td><span className="admin-count-badge">{u.trips}</span></td>
                            <td><span className="admin-count-badge">{u.reviews}</span></td>
                            <td>
                              <span className={`admin-status-badge ${u.isActive ? 'admin-status-active' : 'admin-status-inactive'}`}>
                                {u.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!engagement?.mostActiveUsers?.length) && (
                          <tr><td colSpan={4} className="admin-table-empty">No users yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

                {/* Top Activities */}
                <SectionCard title="Top Activities by Bookings">
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Activity</th>
                          <th>Region</th>
                          <th>Bookings</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topActivities.map((a, i) => (
                          <tr key={a.id}>
                            <td className="admin-rank-cell">{i + 1}</td>
                            <td>
                              <p className="admin-user-name">{a.name}</p>
                              <span className="invoice-type-badge" style={{ marginTop: 3 }}>{a.type}</span>
                            </td>
                            <td className="admin-muted-cell">{a.region}</td>
                            <td><span className="admin-count-badge admin-count-orange">{a.booking_count}</span></td>
                            <td className="admin-muted-cell">{a.rating ? `★ ${Number(a.rating).toFixed(1)}` : '—'}</td>
                          </tr>
                        ))}
                        {!topActivities.length && (
                          <tr><td colSpan={5} className="admin-table-empty">No activities yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard
