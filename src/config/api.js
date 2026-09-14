export const API_BASE_URL = 'http://localhost/crm/Carenet_ERP/public/api'
const WEB_BASE_URL = API_BASE_URL.replace(/\/api$/, '')
const BARCODE_BASE_URL = 'https://barcode.tec-it.com/barcode.ashx'

export const API_URLS = {
  portalLogin: `${API_BASE_URL}/patient-portal/login`,
  portalDashboard: `${API_BASE_URL}/patient-portal/dashboard`,
  portalLabReport: (transactionId) =>
    `${API_BASE_URL}/patient-portal/lab-reports/${encodeURIComponent(transactionId)}/view`,
  portalLabReportDownload: (transactionId) =>
    `${WEB_BASE_URL}/download-report-pdf/${encodeURIComponent(transactionId)}`,
  portalPrescription: (prescriptionId) =>
    `${API_BASE_URL}/patient-portal/prescriptions/${encodeURIComponent(prescriptionId)}`,
  portalLogout: `${API_BASE_URL}/patient-portal/logout`,

  labResult: (invoice, mobile) =>
    `${API_BASE_URL}/lab-result/${encodeURIComponent(invoice)}/${encodeURIComponent(mobile)}`,

  prescriptionsByDetails: `${API_BASE_URL}/prescriptions/by-details`,

  barcode: (text) =>
    `${BARCODE_BASE_URL}?data=${encodeURIComponent(text)}&code=Code128&dpi=96`,
}
