import { getToken } from './auth'

export const API_URL = 'http://localhost:3000'

export const getAuthHeaders = (headers = {}) => {
  const token = getToken()

  if (!token) {
    return headers
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}

export const readJson = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export const getApiErrorMessage = (payload, fallbackMessage) => {
  if (Array.isArray(payload?.message)) {
    return payload.message.join(' • ')
  }

  return payload?.message || fallbackMessage
}
