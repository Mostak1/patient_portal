import axios from 'axios'
import { reactive } from 'vue'
import { API_URLS } from '../config/api'

const TOKEN_KEY = 'patient_portal_token'
const PATIENT_KEY = 'patient_portal_patient'
const EXPIRY_KEY = 'patient_portal_expires_at'
const MUST_RESET_KEY = 'patient_portal_must_reset_password'

export const authState = reactive({
  token: sessionStorage.getItem(TOKEN_KEY) || '',
  patient: readJson(PATIENT_KEY),
  expiresAt: sessionStorage.getItem(EXPIRY_KEY) || '',
  mustResetPassword: sessionStorage.getItem(MUST_RESET_KEY) === 'true',
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
  authState.mustResetPassword = false
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PATIENT_KEY)
  sessionStorage.removeItem(EXPIRY_KEY)
  sessionStorage.removeItem(MUST_RESET_KEY)
}

export function saveSession(data) {
  authState.token = data.access_token
  authState.patient = data.patient || null
  authState.expiresAt = data.expires_at || ''
  authState.mustResetPassword = Boolean(data.must_reset_password)

  sessionStorage.setItem(TOKEN_KEY, authState.token)
  sessionStorage.setItem(PATIENT_KEY, JSON.stringify(authState.patient))
  sessionStorage.setItem(EXPIRY_KEY, authState.expiresAt)
  sessionStorage.setItem(MUST_RESET_KEY, authState.mustResetPassword ? 'true' : 'false')
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
    } else if (error.response?.status === 403 && error.response?.data?.must_reset_password) {
      authState.mustResetPassword = true
      sessionStorage.setItem(MUST_RESET_KEY, 'true')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('patient-portal:must-reset-password'))
      }
    }
    return Promise.reject(error)
  },
)

export async function login(identifier, password = null, options = {}) {
  let payload = {}
  if (typeof identifier === 'object' && identifier !== null) {
    payload = {
      patient_id: identifier.patientId || identifier.patient_id || identifier.customerId || identifier.customer_id || null,
      mobile_number: identifier.mobileNumber || identifier.mobile_number || null,
      password: identifier.password || null,
      customer_id: identifier.customerId || identifier.customer_id || null,
      contact_id: identifier.contactId || identifier.contact_id || null,
    }
  } else {
    payload = {
      patient_id: identifier,
      password: password || null,
      customer_id: options.customerId || options.customer_id || null,
      contact_id: options.contactId || options.contact_id || null,
    }
    if (options.mobileNumber || options.mobile_number) {
      payload.mobile_number = options.mobileNumber || options.mobile_number
    }
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
      delete payload[key]
    }
  })

  const response = await axios.post(API_URLS.portalLogin, payload)
  if (response.data?.access_token) {
    saveSession(response.data)
  }
  return response.data
}

export async function updatePassword(currentPassword, newPassword, newPasswordConfirmation) {
  const response = await portalApi.post(API_URLS.portalUpdatePassword, {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  })
  if (response.data?.access_token) {
    saveSession(response.data)
  }
  return response.data
}

export async function forgotPassword(identifier, email = null) {
  const payload = {}
  if (typeof identifier === 'object' && identifier !== null) {
    Object.assign(payload, identifier)
  } else {
    if (identifier && identifier.includes('@')) {
      payload.email = identifier
    } else if (identifier) {
      payload.mobile_number = identifier
    }
    if (email) payload.email = email
  }
  const response = await axios.post(API_URLS.portalForgotPassword, payload)
  return response.data
}

export async function resetPassword(customerId, token, newPassword, newPasswordConfirmation) {
  const response = await axios.post(API_URLS.portalResetPassword, {
    customer_id: customerId,
    token: token,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  })
  return response.data
}

export async function logout() {
  try {
    if (isSessionValid()) {
      await portalApi.post(API_URLS.portalLogout)
    }
  } catch (error) {
    if (error.response?.status !== 401) {
      console.warn('Portal logout request failed; clearing the local session.')
    }
  } finally {
    clearSession()
  }
}

// Appointment Booking Engine Services
export async function getBookingLocations() {
  const response = await portalApi.get(API_URLS.portalBookingLocations)
  return response.data
}

export async function getBookingDoctors(locationId = null) {
  const response = await portalApi.get(API_URLS.portalBookingDoctors, {
    params: { location_id: locationId },
  })
  return response.data
}

export async function getBookingAvailableDates(locationId, doctorProfileId = null) {
  const url = API_URLS.portalBookingAvailableDates(locationId, doctorProfileId)
  const response = await portalApi.get(url)
  return response.data
}

export async function getBookingAvailableSlots(doctorProfileId, calendarDate, locationId = null) {
  const response = await portalApi.get(API_URLS.portalBookingAvailableSlots, {
    params: {
      doctor_profile_id: doctorProfileId,
      calendar_date: calendarDate,
      location_id: locationId,
    },
  })
  return response.data
}

export async function bookAppointment(bookingData) {
  const response = await portalApi.post(API_URLS.portalBookAppointment, bookingData)
  return response.data
}

export async function getMyAppointments() {
  const response = await portalApi.get(API_URLS.portalMyAppointments)
  return response.data
}

// Public Campaign Intake Form
export async function submitCampaignIntake(intakeData) {
  const response = await axios.post(API_URLS.campaignIntake, intakeData)
  return response.data
}
