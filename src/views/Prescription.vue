<template>
  <div class="prescription-wrapper">
    <div class="prescription-page-toolbar print-hide">
      <button type="button" class="prescription-back-button" @click="goBack">
        <i class="fas fa-arrow-left" aria-hidden="true"></i> Back to prescriptions
      </button>
    </div>

    <div class="prescription-container bg-white">
      <!-- Prescription Header -->
      <PrescriptionHeader
        :prescription="prescription"
        :logo-url="businessLogo"
      />

      <!-- Main Content -->
      <div class="prescription-content px-6 py-2">
        <div v-if="isLoading" class="prescription-loading" role="status" aria-live="polite">
          <div class="prescription-loading-spinner" aria-hidden="true"></div>
          <p class="prescription-loading-title">Loading your prescription</p>
          <p class="prescription-loading-subtitle">Please wait while we securely load your clinical record.</p>
        </div>

        <div v-else-if="error" class="text-center text-red-600 py-6">
          <p>{{ error }}</p>
        </div>

        <div v-else-if="prescriptionData">
          <!-- Patient Info Section -->
          <PrescriptionPatientInfo :prescription="prescription" />

          <!-- Main Clinical Body -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- Left Column: C/C, O/E, Dx, Investigations -->
            <PrescriptionClinicalHistory
              :prescription="prescription"
              :chief-complaints="chiefComplaints"
              :disease-histories="diseaseHistories"
              :investigations="investigations"
            />

            <!-- Right Column: Rx Medicines, Therapies, Advice, Follow-up -->
            <PrescriptionRxPlan
              :prescription="prescription"
              :prescribed-medicines="prescribedMedicines"
              :therapies="therapies"
              :advices="advices"
              :show-ipd-admission="showIpdAdmission"
              :ipd-admission="ipdAdmission"
            />
          </div>
        </div>

        <div v-else class="text-center text-gray-600 py-6">
          <p>No prescription data available. Please try again.</p>
        </div>
      </div>

      <!-- Prescription Footer -->
      <PrescriptionFooter />
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center gap-4 mt-6 mb-6">
      <button
        type="button"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 prescription-download-button"
        @click="downloadPrescription"
      >
        <i class="fas fa-download" aria-hidden="true"></i> Download PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { API_URLS } from '../config/api'
import { portalApi } from '../services/portalApi'
import PrescriptionHeader from '../components/prescription/PrescriptionHeader.vue'
import PrescriptionPatientInfo from '../components/prescription/PrescriptionPatientInfo.vue'
import PrescriptionClinicalHistory from '../components/prescription/PrescriptionClinicalHistory.vue'
import PrescriptionRxPlan from '../components/prescription/PrescriptionRxPlan.vue'
import PrescriptionFooter from '../components/prescription/PrescriptionFooter.vue'

const route = useRoute()
const router = useRouter()
const prescriptionData = ref(null)
const businessLogo = ref('/awc_logo.png')
const isLoading = ref(false)
const error = ref('')

const goBack = () => router.push({ name: 'Dashboard', hash: '#prescriptions' })

// Computed properties
const prescription = computed(() => prescriptionData.value?.prescription || {})
const prescribedMedicines = computed(() => prescriptionData.value?.prescribed_medicines || [])
const prescribedCc = computed(() => prescriptionData.value?.prescribed_cc || [])
const prescribedAdvises = computed(() => prescriptionData.value?.prescribed_advises || [])
const diseaseHistories = computed(() => prescriptionData.value?.disease_histories || [])

const chiefComplaints = computed(() => {
  if (prescribedCc.value && prescribedCc.value.length > 0) {
    return prescribedCc.value
      .map(c => c.comment || c.complain_name)
      .filter(Boolean)
  }
  if (prescription.value.complains) {
    return prescription.value.complains.split(',').map(c => c.trim()).filter(Boolean)
  }
  if (diseaseHistories.value && diseaseHistories.value.length > 0) {
    return diseaseHistories.value
      .map(h => h.chief_complaint)
      .filter(Boolean)
  }
  return []
})

const advices = computed(() => {
  const list = []
  if (prescribedAdvises.value && prescribedAdvises.value.length > 0) {
    for (const a of prescribedAdvises.value) {
      if (a.advise_name) list.push(a.advise_name)
    }
  }
  if (list.length === 0 && prescription.value.advices) {
    return prescription.value.advices.split(',').map(a => a.trim()).filter(Boolean)
  }
  return list
})

const therapies = computed(() => prescriptionData.value?.prescribed_therapies || [])
const investigations = computed(() => prescriptionData.value?.prescribed_tests || [])
const ipdAdmission = computed(() => prescriptionData.value?.ipd_admission || {})

// Check if IPD admission should be shown
const showIpdAdmission = computed(() => {
  return ipdAdmission.value && ipdAdmission.value.is_ipd_admission == 1
})

const fetchPrescriptionData = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await portalApi.get(API_URLS.portalPrescription(route.params.id))
    if (response.data.success && response.data.data) {
      prescriptionData.value = response.data.data
    } else {
      error.value = response.data.message || 'Prescription not found. Please verify your details.'
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to fetch prescription data. Please try again.'
    console.error('Fetch Error:', e)
  } finally {
    isLoading.value = false
  }
}

// Load data on mount
onMounted(() => {
  if (route.state && route.state.prescriptionData) {
    prescriptionData.value = route.state.prescriptionData
  } else if (route.params.id) {
    fetchPrescriptionData()
  } else {
    error.value = 'No prescription data or parameters provided.'
  }
})

// PDF Generation
const downloadPrescription = async () => {
  if (!prescriptionData.value) {
    console.error('No prescription data available for PDF generation')
    return
  }

  const element = document.querySelector('.prescription-container')
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    if (imgHeight <= pageHeight) {
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
    } else if (imgHeight <= pageHeight * 1.35) {
      const scale = (pageHeight - 4) / imgHeight
      const scaledWidth = pdfWidth * scale
      const xOffset = (pdfWidth - scaledWidth) / 2
      doc.addImage(imgData, 'PNG', xOffset, 2, scaledWidth, pageHeight - 4)
    } else {
      let heightLeft = imgHeight
      let position = 0

      doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
        heightLeft -= pageHeight
      }
    }

    doc.save(`Prescription_${prescription.value.prescription_number || 'unknown'}.pdf`)
  } catch (err) {
    console.error('PDF generation failed:', err)
  }
}
</script>

<style scoped>
.prescription-wrapper {
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
}

.prescription-page-toolbar {
  width: min(100% - 2rem, 840px);
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #66808c;
  font-size: .75rem;
}

.prescription-back-button {
  min-height: 40px;
  padding: .5rem .75rem;
  border: 1px solid #c7dce0;
  border-radius: 9px;
  color: #165b72;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}

.prescription-back-button:hover { border-color: #0f766e; background: #f2fbfa; }
.prescription-back-button:active { transform: translateY(1px) scale(.98); }
.prescription-download-button { border: 0; cursor: pointer; }

.prescription-container {
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  height: auto;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
}

.prescription-content {
  flex: 1 0 auto;
  padding: 1rem 1.75rem 1.5rem;
}

.prescription-loading {
  min-height: 390px;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #183b70;
}

.prescription-loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
  border: 4px solid #dbeafe;
  border-top-color: #269e9a;
  border-radius: 9999px;
  animation: prescription-spin .8s linear infinite;
}

.prescription-loading-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.prescription-loading-subtitle {
  max-width: 22rem;
  margin: .45rem 0 0;
  color: #64748b;
  font-size: .875rem;
  line-height: 1.5;
}

@keyframes prescription-spin {
  to { transform: rotate(360deg); }
}

.background-image {
  position: absolute;
  bottom: 80px;
  left: 140px;
  width: 380px;
  height: 380px;
  background-image: url('/bg-image.png');
  background-repeat: no-repeat;
  background-size: contain;
  transform: rotate(45deg);
  transform-origin: left top;
  opacity: 0.12;
  z-index: 1;
  pointer-events: none;
}

@media screen and (max-width: 768px) {
  .prescription-page-toolbar { width: min(100% - 1.5rem, 840px); align-items: flex-start; flex-direction: column; }
  .prescription-wrapper { width: 100%; max-width: 100%; overflow-x: hidden; }
  .prescription-container { width: 100%; height: auto; min-height: 0; margin: 0; overflow: visible; box-shadow: none; border-radius: 0; }
  .prescription-content { padding: 1rem !important; }
  .prescription-loading { min-height: 300px; padding: 2.5rem 1rem; }
  .background-image { display: none; }
  .flex.justify-center.gap-4 { flex-wrap: wrap; }
}

@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .prescription-container {
    width: 210mm;
    min-height: 297mm;
    height: auto;
    margin: 0;
    padding: 0;
    position: relative;
    box-shadow: none;
    border-radius: 0;
  }

  button {
    display: none !important;
  }

  .prescription-page-toolbar {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>
