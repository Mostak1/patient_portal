export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/crm/carenet_erp/public/index.php/api'
const WEB_BASE_URL = API_BASE_URL.replace(/\/index\.php\/api$/, '').replace(/\/api$/, '')
const BARCODE_BASE_URL = 'https://barcode.tec-it.com/barcode.ashx'

export const API_URLS = {
  // Authentication & Credential Lifecycle
  portalLogin: `${API_BASE_URL}/patient-portal/login`,
  portalForgotPassword: `${API_BASE_URL}/patient-portal/forgot-password`,
  portalResetPassword: `${API_BASE_URL}/patient-portal/reset-password`,
  portalUpdatePassword: `${API_BASE_URL}/patient-portal/update-password`,
  portalLogout: `${API_BASE_URL}/patient-portal/logout`,

  // Clinical Records & Dashboard
  portalDashboard: `${API_BASE_URL}/patient-portal/dashboard`,
  portalLabReport: (transactionId) =>
    `${API_BASE_URL}/patient-portal/lab-reports/${encodeURIComponent(transactionId)}/view`,
  portalLabReportDownload: (transactionId) =>
    `${WEB_BASE_URL}/download-report-pdf/${encodeURIComponent(transactionId)}`,
  portalPrescription: (prescriptionId) =>
    `${API_BASE_URL}/patient-portal/prescriptions/${encodeURIComponent(prescriptionId)}`,

  // Appointment Booking Engine
  portalBookingLocations: `${API_BASE_URL}/patient-portal/booking/locations`,
  portalBookingDoctors: `${API_BASE_URL}/patient-portal/booking/doctors`,
  portalBookingAvailableDates: (locationId, doctorId) =>
    `${API_BASE_URL}/patient-portal/booking/available-dates/${encodeURIComponent(locationId)}?doctor_profile_id=${encodeURIComponent(doctorId || '')}`,
  portalBookingAvailableSlots: `${API_BASE_URL}/patient-portal/booking/available-slots`,
  portalBookAppointment: `${API_BASE_URL}/patient-portal/booking/book`,
  portalMyAppointments: `${API_BASE_URL}/patient-portal/my-appointments`,

  // Public Campaign & Unregistered Visitor Intake Form
  campaignIntake: `${API_BASE_URL}/campaign/intake`,

  labResult: (invoice, mobile) =>
    `${API_BASE_URL}/lab-result/${encodeURIComponent(invoice)}/${encodeURIComponent(mobile)}`,
  prescriptionsByDetails: `${API_BASE_URL}/prescriptions/by-details`,
  barcode: (text) =>
    `${BARCODE_BASE_URL}?data=${encodeURIComponent(text)}&code=Code128&dpi=96`,
}
