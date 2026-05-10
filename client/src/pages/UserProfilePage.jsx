import { useState } from 'react'
import { Link } from 'react-router-dom'

// Palette: #767f9e | #daa464 | #dec384 | #e8ddb4

const MOCK_USER = {
  firstName: 'Jalay',
  lastName:  'Shah',
  email:     'jalay@example.com',
  phone:     '+91 98765 43210',
  city:      'Surat',
  country:   'India',
  pictureUrl: null,
}

const PREPLANNED_TRIPS = [
  { id: 1, name: 'Europe Summer',  dates: 'Jun 12 – Jun 28, 2025', destinations: 4, cover: 'https://picsum.photos/seed/europe-summer/400/300' },
  { id: 2, name: 'Bali Escape',    dates: 'Aug 5 – Aug 14, 2025',  destinations: 2, cover: 'https://picsum.photos/seed/bali-escape/400/300'  },
  { id: 3, name: 'Japan Odyssey',  dates: 'Oct 1 – Oct 15, 2025',  destinations: 5, cover: 'https://picsum.photos/seed/japan-odyssey/400/300'},
]

const PREVIOUS_TRIPS = [
  { id: 4, name: 'Dubai Luxe',     dates: 'Dec 20 – Dec 27, 2024', destinations: 1, cover: 'https://picsum.photos/seed/dubai-luxe/400/300'   },
  { id: 5, name: 'Rajasthan Royal',dates: 'Jan 10 – Jan 18, 2025', destinations: 3, cover: 'https://picsum.photos/seed/rajasthan-royal/400/300'},
  { id: 6, name: 'Rome & Paris',   dates: 'Mar 3 – Mar 14, 2025',  destinations: 2, cover: 'https://picsum.photos/seed/rome-paris/400/300'   },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="bg-white border-b border-[#dec384] shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#767f9e] to-[#daa464] flex items-center justify-center shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#3d4460] tracking-wide">Traveloop</span>
        </Link>

        <Link
          to="/home"
          className="flex items-center gap-1.5 text-sm text-[#767f9e] hover:text-[#daa464] transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-5.25h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
          </svg>
          Home
        </Link>
      </div>
    </nav>
  )
}

function TripCard({ trip, onView }) {
  return (
    <div className="bg-white rounded-xl border border-[#dec384] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-[#e8ddb4] overflow-hidden">
        <img
          src={trip.cover}
          alt={trip.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
          <p className="text-white text-xs font-semibold truncate">{trip.name}</p>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[#767f9e] text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {trip.dates}
        </p>
        <p className="text-[#767f9e] text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {trip.destinations} destination{trip.destinations !== 1 ? 's' : ''}
        </p>

        <button
          onClick={() => onView(trip)}
          className="mt-auto w-full py-1.5 rounded-lg bg-[#e8ddb4] hover:bg-[#d6c99d] active:bg-[#c4b88c] text-[#767f9e] font-semibold text-xs tracking-wide transition-all shadow-sm"
        >
          View
        </button>
      </div>
    </div>
  )
}

function TripSection({ title, trips, onView }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#3d4460] mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-[#daa464] inline-block" />
        {title}
      </h2>
      {trips.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#dec384] p-8 text-center">
          <p className="text-[#767f9e] text-sm">No trips here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onView={onView} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-[#dec384] bg-white text-sm text-[#3d4460] placeholder:text-[#767f9e]/50 outline-none focus:ring-2 focus:ring-[#daa464] focus:border-[#daa464] transition-all'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#3d4460]">Edit Profile</h2>
          <button onClick={onClose} className="text-[#767f9e] hover:text-[#daa464] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#767f9e] mb-1">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className={inputCls} placeholder="First name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#767f9e] mb-1">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={inputCls} placeholder="Last name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#767f9e] mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} placeholder="Email" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#767f9e] mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputCls} placeholder="Phone number" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#767f9e] mb-1">City</label>
              <input name="city" value={form.city} onChange={handleChange} className={inputCls} placeholder="City" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#767f9e] mb-1">Country</label>
              <input name="country" value={form.country} onChange={handleChange} className={inputCls} placeholder="Country" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[#dec384] text-[#767f9e] text-sm font-semibold hover:bg-[#f5f0e4] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2 rounded-lg bg-[#e8ddb4] hover:bg-[#d6c99d] active:bg-[#c4b88c] text-[#767f9e] text-sm font-bold shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const [user, setUser]           = useState(MOCK_USER)
  const [showEdit, setShowEdit]   = useState(false)

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  function handleView(trip) {
    // Navigate to trip detail — route TBD
    alert(`Viewing trip: ${trip.name}`)
  }

  function handleSave(updated) {
    setUser(updated)
    setShowEdit(false)
  }

  return (
    <div className="min-h-screen bg-[#e8ddb4]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* ── User Profile Card ── */}
        <div className="bg-white rounded-2xl shadow-md border border-[#dec384] p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="shrink-0">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#dec384] shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#767f9e] to-[#daa464] flex items-center justify-center border-4 border-[#dec384] shadow">
                <span className="text-white text-2xl font-bold tracking-wide">{initials}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-xl font-bold text-[#3d4460]">
              {user.firstName} {user.lastName}
            </h1>

            <div className="mt-2 space-y-1">
              <Detail icon="email"    value={user.email} />
              {user.phone   && <Detail icon="phone"    value={user.phone} />}
              {(user.city || user.country) && (
                <Detail icon="location" value={[user.city, user.country].filter(Boolean).join(', ')} />
              )}
            </div>

            <button
              onClick={() => setShowEdit(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#e8ddb4] hover:bg-[#d6c99d] active:bg-[#c4b88c] text-[#767f9e] text-sm font-semibold shadow-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* ── Preplanned Trips ── */}
        <TripSection title="Preplanned Trips" trips={PREPLANNED_TRIPS} onView={handleView} />

        {/* ── Previous Trips ── */}
        <TripSection title="Previous Trips" trips={PREVIOUS_TRIPS} onView={handleView} />

      </main>

      {showEdit && (
        <EditModal user={user} onClose={() => setShowEdit(false)} onSave={handleSave} />
      )}
    </div>
  )
}

// ── Detail row ────────────────────────────────────────────────────────────────

function Detail({ icon, value }) {
  const icons = {
    email: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    location: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }

  return (
    <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-[#767f9e]">
      {icons[icon]}
      <span className="truncate">{value}</span>
    </p>
  )
}
