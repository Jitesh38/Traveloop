import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveSession } from '../utils/auth'

// Palette: #767f9e | #daa464 | #dec384 | #e8ddb4
const API_URL = 'http://localhost:3000'

const RULES = {
  email: [
    { test: (v) => v.trim().length > 0,                                       msg: 'Email is required.' },
    { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),              msg: 'Enter a valid email address.' },
  ],
  password: [
    { test: (v) => v.length > 0,  msg: 'Password is required.' },
    { test: (v) => v.length >= 6, msg: 'Password must be at least 6 characters.' },
  ],
}

function validate(fields) {
  const errors = {}
  for (const [field, rules] of Object.entries(RULES)) {
    for (const rule of rules) {
      if (!rule.test(fields[field])) {
        errors[field] = rule.msg
        break
      }
    }
  }
  return errors
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [fields, setFields]             = useState({ email: '', password: '' })
  const [errors, setErrors]             = useState({})
  const [touched, setTouched]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [apiError, setApiError]         = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...fields, [name]: value }
    setFields(updated)
    if (touched[name]) {
      const errs = validate(updated)
      setErrors((prev) => ({ ...prev, [name]: errs[name] }))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const errs = validate(fields)
    setErrors((prev) => ({ ...prev, [name]: errs[name] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    setTouched({ email: true, password: true })
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      let res
      try {
        res = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: fields.email.trim(), password: fields.password }),
        })
      } catch {
        setApiError('Cannot connect to server. Make sure the backend is running.')
        return
      }

      let data = null
      try { data = await res.json() } catch { /* non-JSON body */ }

      if (res.status === 200) {
        saveSession(data.accessToken, data.user)
        navigate('/home')
        return
      }
      if (res.status === 401) {
        setApiError('Invalid email or password. Please try again.')
        return
      }
      const msg = Array.isArray(data?.message)
        ? data.message.join(' • ')
        : (data?.message ?? `Server error (${res.status}).`)
      setApiError(msg)
    } catch (err) {
      setApiError(`Unexpected error: ${err?.message ?? 'Unknown'}`)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (field) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all placeholder:text-[#767f9e]/50 text-[#3d4460] ` +
    (errors[field] && touched[field]
      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
      : 'border-[#dec384] bg-white focus:ring-2 focus:ring-[#daa464] focus:border-[#daa464]')

  return (
    <div className="min-h-screen bg-[#e8ddb4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#767f9e] to-[#daa464] flex items-center justify-center shadow-lg mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#3d4460] tracking-wide">Traveloop</h1>
          <p className="text-sm text-[#767f9e] mt-1">Plan your perfect journey</p>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#767f9e] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@email.com"
              className={inputCls('email')}
            />
            {errors.email && touched.email && <ErrorMsg msg={errors.email} />}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#767f9e] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={fields.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={inputCls('password') + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767f9e] hover:text-[#daa464] transition-colors"
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
            </div>
            {errors.password && touched.password && <ErrorMsg msg={errors.password} />}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button type="button" className="text-xs text-[#767f9e] hover:text-[#daa464] hover:underline transition-colors font-medium">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#e8ddb4] hover:bg-[#d6c99d] active:bg-[#c4b88c] disabled:opacity-60 disabled:cursor-not-allowed text-[#767f9e] font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#767f9e]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#daa464] font-bold hover:text-[#c4904e] hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

function ErrorMsg({ msg }) {
  return (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {msg}
    </p>
  )
}
