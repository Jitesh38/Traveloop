import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from './AppHeader'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../utils/api'
import { fallbackRegionImages, fallbackTripImage } from '../utils/trips'

function DonutChart({ subtotal, taxAmount, grandTotal }) {
  const subtotalPct = grandTotal > 0 ? (subtotal / grandTotal) * 100 : 0
  return (
    <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
      <div style={{
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: grandTotal > 0
          ? `conic-gradient(#20a9f3 0% ${subtotalPct.toFixed(2)}%, #ff6846 ${subtotalPct.toFixed(2)}% 100%)`
          : '#e9eef5',
        boxShadow: '0 8px 20px rgba(17,24,39,0.10)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'inset 0 2px 6px rgba(17,24,39,0.06)',
        }} />
      </div>
    </div>
  )
}

function InvoicePage() {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  useEffect(() => {
    let ignore = false

    const loadInvoice = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/activity/invoice/${tripId}`, {
          headers: getAuthHeaders(),
        })
        const payload = await readJson(res)
        if (!res.ok) throw new Error(getApiErrorMessage(payload, 'Failed to load invoice.'))
        if (!ignore) setInvoice(payload)
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load invoice.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInvoice()
    return () => { ignore = true }
  }, [tripId])

  const handleMarkPaid = async () => {
    if (!invoice) return
    setMarkingPaid(true)
    setStatusMessage(null)
    setError(null)
    try {
      const newIsPaid = !invoice.isPaid
      const res = await fetch(`${API_URL}/activity/invoice/${tripId}/mark-paid`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isPaid: newIsPaid }),
      })
      const payload = await readJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(payload, 'Failed to update payment status.'))
      setInvoice((prev) => ({ ...prev, isPaid: payload.isPaid }))
      setStatusMessage(payload.message || (newIsPaid ? 'Marked as paid.' : 'Marked as unpaid.'))
    } catch (err) {
      setError(err.message || 'Failed to update payment status.')
    } finally {
      setMarkingPaid(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/activity/invoice/${tripId}/download`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to download invoice PDF.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-trip-${tripId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Failed to download invoice.')
    } finally {
      setDownloading(false)
    }
  }

  const invoiceId = `INV-${String(tripId).padStart(6, '0')}`
  const tripImage = invoice
    ? (fallbackRegionImages[invoice.region] || fallbackTripImage)
    : fallbackTripImage

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Invoice page">
        <AppHeader onHomeClick={() => navigate('/home')} />

        <div className="itinerary-page">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="invoice-back-link"
          >
            <span aria-hidden="true">←</span> back to My Trips
          </button>

          {error && <p className="empty-row">{error}</p>}
          {statusMessage && <p className="empty-row itinerary-success">{statusMessage}</p>}

          {loading ? (
            <p className="empty-row">Loading invoice...</p>
          ) : invoice ? (
            <>
              {/* Top section */}
              <div className="invoice-top-grid">
                {/* Invoice info card */}
                <div className="invoice-card">
                  <div className="invoice-card-inner">
                    {/* Trip image */}
                    <div
                      className="invoice-trip-image"
                      style={{ backgroundImage: `url(${tripImage})` }}
                      aria-hidden="true"
                    />

                    {/* Trip details */}
                    <div className="invoice-trip-details">
                      <span className="invoice-kicker">Trip Invoice</span>
                      <h2 className="invoice-trip-name">
                        {invoice.tripName || invoice.region}
                      </h2>
                      <p className="invoice-trip-meta">
                        {new Date(invoice.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' – '}
                        {new Date(invoice.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}{invoice.durationDays} day{invoice.durationDays !== 1 ? 's' : ''}
                        {' · '}{invoice.region}
                      </p>

                      <div className="invoice-meta-row">
                        <div>
                          <p className="invoice-meta-label">Invoice ID</p>
                          <p className="invoice-meta-value">{invoiceId}</p>
                        </div>
                        <div>
                          <p className="invoice-meta-label">Generated</p>
                          <p className="invoice-meta-value">
                            {new Date(invoice.generatedAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Traveler + status */}
                    <div className="invoice-traveler">
                      <div>
                        <p className="invoice-meta-label" style={{ textAlign: 'right' }}>Traveler Details</p>
                        <p className="invoice-meta-value" style={{ textAlign: 'right' }}>{invoice.customer.name}</p>
                        <p className="invoice-customer-email">{invoice.customer.email}</p>
                      </div>
                      <span className={`invoice-status-badge ${invoice.isPaid ? 'invoice-status-paid' : 'invoice-status-pending'}`}>
                        <span className="invoice-status-dot" />
                        Payment status — {invoice.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget insights card */}
                <div className="invoice-insights-card">
                  <p className="invoice-insights-title">Budget Insights</p>

                  <div className="invoice-insights-chart-row">
                    <DonutChart
                      subtotal={invoice.summary.subtotal}
                      taxAmount={invoice.summary.taxAmount}
                      grandTotal={invoice.summary.grandTotal}
                    />
                    <div className="invoice-insights-legend">
                      <div>
                        <div className="invoice-legend-label">
                          <span className="invoice-legend-dot" style={{ background: '#20a9f3' }} />
                          <span>Activities</span>
                        </div>
                        <p className="invoice-legend-value">
                          Rs {invoice.summary.subtotal.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <div className="invoice-legend-label">
                          <span className="invoice-legend-dot" style={{ background: '#ff6846' }} />
                          <span>Tax ({invoice.summary.taxRate}%)</span>
                        </div>
                        <p className="invoice-legend-value">
                          Rs {invoice.summary.taxAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="invoice-grand-total-box">
                    <p className="invoice-meta-label">Grand Total</p>
                    <p className="invoice-grand-total-value">
                      Rs {invoice.summary.grandTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div className="invoice-table-card">
                <table className="invoice-table">
                  <thead>
                    <tr className="invoice-table-head-row">
                      {['#', 'Category', 'Description', 'Qty / Details', 'Unit Cost', 'Amount'].map((col, i) => (
                        <th
                          key={col}
                          className="invoice-th"
                          style={{ textAlign: i === 0 ? 'center' : 'left' }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {invoice.lineItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="invoice-empty-row">
                          No line items found for this trip.
                        </td>
                      </tr>
                    ) : invoice.lineItems.map((item, idx) => (
                      <tr key={item.activityId} className="invoice-body-row">
                        <td className="invoice-td" style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 900 }}>
                          {idx + 1}
                        </td>
                        <td className="invoice-td">
                          <span className="invoice-type-badge">
                            {item.type || 'Activity'}
                          </span>
                        </td>
                        <td className="invoice-td invoice-td-name">{item.name}</td>
                        <td className="invoice-td invoice-td-muted">
                          {item.durationDays} day{item.durationDays !== 1 ? 's' : ''}
                        </td>
                        <td className="invoice-td invoice-td-muted">
                          Rs {item.pricePerDay.toLocaleString('en-IN')}
                        </td>
                        <td className="invoice-td invoice-td-amount">
                          Rs {item.lineTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="invoice-foot-row">
                      <td colSpan={5} className="invoice-foot-label">Subtotal</td>
                      <td className="invoice-foot-value">Rs {invoice.summary.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="invoice-foot-row">
                      <td colSpan={5} className="invoice-foot-label">Tax ({invoice.summary.taxRate}%)</td>
                      <td className="invoice-foot-value" style={{ color: '#ff6846' }}>
                        Rs {invoice.summary.taxAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="invoice-foot-grand-row">
                      <td colSpan={5} className="invoice-foot-grand-label">Grand Total</td>
                      <td className="invoice-foot-grand-value">
                        Rs {invoice.summary.grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer actions */}
              <div className="invoice-footer">
                <div className="invoice-footer-left">
                  <button
                    type="button"
                    className="trip-action-button invoice-secondary-button"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? 'Downloading...' : 'Download Invoice'}
                  </button>
                  <button
                    type="button"
                    className="trip-action-button invoice-secondary-button"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    Export as PDF
                  </button>
                </div>
                <button
                  type="button"
                  className={`trip-action-button ${invoice.isPaid ? 'trip-action-button-soft-orange' : 'trip-action-button-orange'}`}
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                >
                  {markingPaid ? 'Updating...' : invoice.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default InvoicePage
