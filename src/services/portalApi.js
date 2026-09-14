import axios from 'axios'
import { reactive } from 'vue'
import { API_URLS } from '../config/api'

const TOKEN_KEY = 'patient_portal_token'
const PATIENT_KEY = 'patient_portal_patient'
const EXPIRY_KEY = 'patient_portal_expires_at'

export const authState = reactive({
  token: sessionStorage.getItem(TOKEN_KEY) || '',
  patient: readJson(PATIENT_KEY),
  expiresAt: sessionStorage.getItem(EXPIRY_KEY) || '',
})

function readJson(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

export function isSessionValid() {
  if (!authState.token) return false
  if (!authState.expiresAt) return true
  const valid = new Date(authState.expiresAt).getTime() > Date.now()
  if (!valid) clearSession()
  return valid
}

export function clearSession() {
  authState.token = ''
  authState.patient = null
  authState.expiresAt = ''
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PATIENT_KEY)
  sessionStorage.removeItem(EXPIRY_KEY)
}

export function saveSession(data) {
  authState.token = data.access_token
  authState.patient = data.patient || null
  authState.expiresAt = data.expires_at || ''
  sessionStorage.setItem(TOKEN_KEY, authState.token)
  sessionStorage.setItem(PATIENT_KEY, JSON.stringify(authState.patient))
  sessionStorage.setItem(EXPIRY_KEY, authState.expiresAt)
}

export const portalApi = axios.create()

portalApi.interceptors.request.use((config) => {
  if (isSessionValid()) {
    config.headers.Authorization = `Bearer ${authState.token}`
  } else if (authState.token) {
    clearSession()
  }
  return config
})

portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLogoutRequest = error.config?.url === API_URLS.portalLogout
      clearSession()

      if (!isLogoutRequest && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('patient-portal:session-expired'))
      }
    }
    return Promise.reject(error)
  },
)

export async function login(customerId, mobileNumber) {
  const response = await axios.post(API_URLS.portalLogin, {
    customer_id: customerId,
    mobile_number: mobileNumber,
  })
  saveSession(response.data)
  return response.data
}

export async function logout() {
  try {
    if (isSessionValid()) {
      await portalApi.post(API_URLS.portalLogout)
    }
  } catch (error) {
    // An expired or already-revoked token means the server session is already
    // unavailable. Local logout must still complete successfully.
    if (error.response?.status !== 401) {
      console.warn('Portal logout request failed; clearing the local session.')
    }
  } finally {
    clearSession()
  }
}
