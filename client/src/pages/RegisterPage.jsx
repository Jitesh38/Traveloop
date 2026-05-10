import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PhotoUpload from '../components/auth/PhotoUpload'
import { COUNTRY_CODES, DEFAULT_COUNTRY, phoneErrorMsg } from '../data/countryCodes'
import { saveSession } from '../utils/auth'

// Palette: #767f9e | #daa464 | #dec384 | #e8ddb4
const API_URL = 'http://localhost:3000'

// ---------- Validation rules ----------
const STATIC_RULES = {
  firstName: [
    { test: (v) => v.trim().length > 0,               msg: 'First name is required.' },
    { test: (v) => v.trim().length >= 2,               msg: 'Must be at least 2 characters.' },
    { test: (v) => v.trim().length <= 50,              msg: 'Must not exceed 50 characters.' },
    { test: (v) => /^[a-zA-Z\s'-]+$/.test(v.trim()),  msg: 'Letters only.' },
  ],
  lastName: [
    { test: (v) => v.trim().length > 0,               msg: 'Last name is required.' },
    { test: (v) => v.trim().length >= 2,               msg: 'Must be at least 2 characters.' },
    { test: (v) => v.trim().length <= 50,              msg: 'Must not exceed 50 characters.' },
    { test: (v) => /^[a-zA-Z\s'-]+$/.test(v.trim()),  msg: 'Letters only.' },
  ],
  email: [
    { test: (v) => v.trim().length > 0,                                          msg: 'Email is required.' },
    { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),                 msg: 'Enter a valid email address.' },
    { test: (v) => v.trim().length <= 100,                                       msg: 'Must not exceed 100 characters.' },
  ],
  password: [
    { test: (v) => v.length > 0,         msg: 'Password is required.' },
    { test: (v) => v.length >= 8,         msg: 'Must be at least 8 characters.' },
    { test: (v) => v.length <= 64,        msg: 'Must not exceed 64 characters.' },
    { test: (v) => /[A-Z]/.test(v),       msg: 'Must include an uppercase letter.' },
    { test: (v) => /[a-z]/.test(v),       msg: 'Must include a lowercase letter.' },
    { test: (v) => /\d/.test(v),          msg: 'Must include a number.' },
    { test: (v) => /[\W_]/.test(v),       msg: 'Must include a special character (e.g. @, #, !).' },
  ],
  city: [
    { test: (v) => v.trim().length > 0,   msg: 'City is required.' },
    { test: (v) => v.trim().length >= 2,  msg: 'Must be at least 2 characters.' },
  ],
  country: [
    { test: (v) => v.trim().length > 0,   msg: 'Country is required.' },
    { test: (v) => v.trim().length >= 2,  msg: 'Must be at least 2 characters.' },
  ],
}

function validate(fields, selectedCountry) {
  const errors = {}
  for (const [field, rules] of Object.entries(STATIC_RULES)) {
    for (const rule of rules) {
      if (!rule.test(fields[field])) {
        errors[field] = rule.msg
        break
      }
    }
  }
  const phoneErr = phoneErrorMsg(fields.phone, selectedCountry)
  if (phoneErr) errors.phone = phoneErr
  return errors
}

const INITIAL = {
  firstName: '', lastName: '', email: '', password: '',
  phone: '', city: '', country: '', additionalInformation: '',
}

// ---------- Sub-components ----------
function ErrorMsg({ msg }) {
  return (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {msg}
    </p>
  )
}

function InputField({ label, id, name, type = 'text', value, placeholder, error, touched, onChange, onBlur, autoComplete, suffix }) {
  const hasError = error && touched
  const base = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all placeholder:text-[#767f9e]/50 text-[#3d4460] `
  const cls = base + (hasError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-[#dec384] bg-white focus:ring-2 focus:ring-[#daa464] focus:border-[#daa464]')

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#767f9e] mb-1">{label}</label>
      <div className="relative">
        <input
          id={id} name={name} type={type} autoComplete={autoComplete}
          value={value} placeholder={placeholder}
          onChange={onChange} onBlur={onBlur}
          className={cls + (suffix ? ' pr-10' : '')}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {hasError && <ErrorMsg msg={error} />}
    </div>
  )
}

// ---------- Main component ----------
export default function RegisterPage() {
  const navigate = useNavigate()
  const [fields, setFields]                   = useState(INITIAL)
  const [errors, setErrors]                   = useState({})
  const [touched, setTouched]                 = useState({})
  const [photoPreview, setPhotoPreview]       = useState(null)
  const [photoFile, setPhotoFile]             = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY)
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [apiError, setApiError]               = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...fields, [name]: value }
    setFields(updated)
    if (touched[name]) {
      const errs = validate(updated, selectedCountry)
      setErrors((prev) => ({ ...prev, [name]: errs[name] }))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const errs = validate(fields, selectedCountry)
    setErrors((prev) => ({ ...prev, [name]: errs[name] }))
  }

  function handleCountryCodeChange(e) {
    const [dialCode, name] = e.target.value.split('||')
    const country = COUNTRY_CODES.find(c => c.dialCode === dialCode && c.name === name)
    setSelectedCountry(country)
    if (touched.phone) {
      setErrors((prev) => ({ ...prev, phone: phoneErrorMsg(fields.phone, country) }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    const allTouched = Object.keys(INITIAL).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTouched(allTouched)
    const errs = validate(fields, selectedCountry)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('firstName',  fields.firstName.trim())
      formData.append('lastName',   fields.lastName.trim())
      formData.append('email',      fields.email.trim())
      formData.append('password',   fields.password)
      if (fields.phone.trim()) {
        // Send full international number: dialCode + digits only
        formData.append('phone', `${selectedCountry.dialCode}${fields.phone.replace(/\D/g, '')}`)
      }
      if (fields.city.trim())    formData.append('city',    fields.city.trim())
      if (fields.country.trim()) formData.append('country', fields.country.trim())
      if (fields.additionalInformation.trim()) {
        formData.append('additionalInformation', fields.additionalInformation.trim())
      }
      if (photoFile) formData.append('picture', photoFile)

      let res
      try {
        res = await fetch(`${API_URL}/users/register`, { method: 'POST', body: formData })
      } catch {
        // fetch() itself threw — server is down or CORS is blocking (browser shows this as TypeError)
        setApiError(
          'Cannot connect to the server. Make sure the backend is running (npm run start:dev) and CORS is enabled.'
        )
        return
      }

      // Safely parse JSON — server might return HTML on unexpected errors
      let data = null
      try { data = await res.json() } catch { /* non-JSON body, data stays null */ }

      if (res.status === 201) {
        saveSession(data.accessToken, data.user)
        navigate('/home')
        return
      }
      if (res.status === 409) {
        setErrors((prev) => ({ ...prev, email: 'This email is already registered.' }))
        setTouched((prev) => ({ ...prev, email: true }))
        return
      }
      // 400 or other server validation errors
      const msg = Array.isArray(data?.message)
        ? data.message.join(' • ')
        : (data?.message ?? `Server returned ${res.status}. Check backend logs.`)
      setApiError(msg)
    } catch (err) {
      setApiError(`Unexpected error: ${err?.message ?? 'Unknown'}`)
    } finally {
      setLoading(false)
    }
  }

  const fp = (name, label, placeholder, extra = {}) => ({
    id: name, name, label, placeholder,
    value: fields[name], error: errors[name], touched: touched[name],
    onChange: handleChange, onBlur: handleBlur,
    ...extra,
  })

  const phoneHasError = errors.phone && touched.phone

  return (
    <div className="min-h-screen bg-[#e8ddb4] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-[#3d4460] tracking-wide">Create Account</h1>
          <p className="text-sm text-[#767f9e] mt-1">Join Traveloop and start planning</p>
        </div>

        <PhotoUpload
          image={photoPreview}
          onChange={(preview, file) => { setPhotoPreview(preview); setPhotoFile(file) }}
        />

        {/* Server-level error banner */}
        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Row 1: First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <InputField {...fp('firstName', 'First Name', 'First name')} />
            <InputField {...fp('lastName',  'Last Name',  'Last name')} />
          </div>

          {/* Row 2: Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <InputField {...fp('email', 'Email Address', 'you@email.com', { type: 'email', autoComplete: 'email' })} />

            {/* Phone with country code dropdown */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-[#767f9e] mb-1">
                Phone <span className="font-normal text-[#767f9e]/60">(optional)</span>
              </label>
              <div className={`flex rounded-lg border overflow-hidden transition-all focus-within:ring-2
                ${phoneHasError
                  ? 'border-red-400 focus-within:ring-red-300'
                  : 'border-[#dec384] focus-within:ring-[#daa464] focus-within:border-[#daa464]'}`}
              >
                <select
                  value={`${selectedCountry.dialCode}||${selectedCountry.name}`}
                  onChange={handleCountryCodeChange}
                  className="w-[4.5rem] shrink-0 bg-[#f5f0e4] border-r border-[#dec384] px-1 py-2 text-xs text-[#3d4460] outline-none cursor-pointer"
                  title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
                >
                  {COUNTRY_CODES.map(cc => (
                    <option key={`${cc.dialCode}||${cc.name}`} value={`${cc.dialCode}||${cc.name}`}>
                      {cc.flag} {cc.dialCode}
                    </option>
                  ))}
                </select>
                <input
                  id="phone" name="phone" type="tel"
                  value={fields.phone}
                  placeholder={`${selectedCountry.minDigits}${selectedCountry.minDigits !== selectedCountry.maxDigits ? `–${selectedCountry.maxDigits}` : ''} digits`}
                  onChange={handleChange} onBlur={handleBlur}
                  className={`flex-1 min-w-0 px-2 py-2 text-sm text-[#3d4460] placeholder:text-[#767f9e]/50 outline-none ${phoneHasError ? 'bg-red-50' : 'bg-white'}`}
                />
              </div>
              {phoneHasError && <ErrorMsg msg={errors.phone} />}
            </div>
          </div>

          {/* Password — full width */}
          <InputField
            {...fp('password', 'Password', 'Min 8 chars, uppercase, number, special char', {
              type: showPassword ? 'text' : 'password',
              autoComplete: 'new-password',
              suffix: (
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-[#767f9e] hover:text-[#daa464] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              ),
            })}
          />

          {/* Row 3: City + Country */}
          <div className="grid grid-cols-2 gap-3">
            <InputField {...fp('city',    'City',    'Your city')} />
            <InputField {...fp('country', 'Country', 'Your country')} />
          </div>

          {/* Additional Info */}
          <div>
            <label htmlFor="additionalInformation" className="block text-xs font-semibold text-[#767f9e] mb-1">
              Additional Information <span className="font-normal text-[#767f9e]/60">(optional)</span>
            </label>
            <textarea
              id="additionalInformation" name="additionalInformation"
              rows={3}
              value={fields.additionalInformation}
              placeholder="Tell us about yourself or your travel interests..."
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#dec384] bg-white text-sm text-[#3d4460] placeholder:text-[#767f9e]/50 outline-none resize-none focus:ring-2 focus:ring-[#daa464] focus:border-[#daa464] transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#e8ddb4] hover:bg-[#d6c99d] active:bg-[#c4b88c] disabled:opacity-60 disabled:cursor-not-allowed text-[#767f9e] font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {loading ? 'Registering...' : 'Register Users'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#767f9e]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#daa464] font-bold hover:text-[#c4904e] hover:underline transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
