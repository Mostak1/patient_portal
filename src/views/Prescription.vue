<template>
  <div class="prescription-wrapper">
    <div class="prescription-page-toolbar print-hide">
      <button type="button" class="prescription-back-button" @click="goBack"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to prescriptions</button>
    </div>
    <div class="prescription-container bg-white">
      <!-- Prescription Header -->
      <div class="prescription-header absolute top-0 left-0 w-full bg-white z-10">
        <div class="max-w-4xl mx-auto px-8 py-4">
          <div class="doctor-info flex justify-between items-start">
            <div class="clinic-logo">
              <img :src="businessLogo" alt="Clinic Logo" class="h-20">
            </div>
            <div class="doctor-details text-right">
              <h2 class="text-2xl font-bold">{{ prescription.assigned_doctor_first_name }} {{ prescription.assigned_doctor_last_name }}</h2>
              <div class="qualifications text-sm" v-html="prescription.show_in_pad"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="prescription-content pt-28 pb-20 px-8">
        <div v-if="isLoading" class="prescription-loading" role="status" aria-live="polite">
          <div class="prescription-loading-spinner" aria-hidden="true"></div>
          <p class="prescription-loading-title">Loading your prescription</p>
          <p class="prescription-loading-subtitle">Please wait while we securely load your clinical record.</p>
        </div>
        <div v-else-if="error" class="text-center text-red-600">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="prescriptionData">
          <!-- Patient Info Section -->
          <div class="prescription-patient-info patient-info border border-black rounded-3xl py-4 px-6 mb-6 grid grid-cols-6 text-center mt-14">
            <div class="col-span-2">
              <p class="text-sm">Patient Name</p>
              <p class="font-bold">{{ prescription.patient_first_name }} {{ prescription.patient_last_name || '' }} {{ prescription.customerId ? '(' + prescription.customerId + ')' : '' }}</p>
            </div>
            <div>
              <p class="text-sm">Age</p>
              <p>{{ prescription.age || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm">Sex</p>
              <p>{{ capitalizeFirstLetter(prescription.gender) || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm">Date</p>
              <p>{{ formatDate(prescription.visit_date) }}</p>
            </div>
            <div class="flex items-center justify-center">
              <img v-if="prescription.customerId" :src="generateBarcode(prescription.customerId)" class="h-8">
            </div>
          </div>

          <!-- Main Content -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- Left Column -->
            <div class="md:col-span-3">
              <div class="mb-6">
                <h3 class="font-bold text-lg mb-1">C/C:</h3>
                <p class="text-sm">
                  <span v-for="(history, index) in diseaseHistories" :key="index">
                    {{ history.chief_complaint }}<br v-if="index < diseaseHistories.length - 1">
                  </span>
                  <span v-if="diseaseHistories.length === 0">No complaints recorded</span>
                </p>
              </div>
              <div class="mb-6">
                <h3 class="font-bold text-lg mb-1">O/E:</h3>
                <table class="w-full text-sm">
                  <tr v-if="prescription.current_height_feet">
                    <td class="py-0.5">Height:</td>
                    <td class="py-0.5">{{ prescription.current_height_feet }} ft <span v-if="prescription.current_height_inches">{{ prescription.current_height_inches }}"</span></td>
                  </tr>
                  <tr v-if="prescription.current_weight">
                    <td class="py-0.5">Weight:</td>
                    <td class="py-0.5">{{ prescription.current_weight }} kg</td>
                  </tr>
                  <tr v-if="prescription.current_height_feet && prescription.current_weight">
                    <td class="py-0.5">BMI:</td>
                    <td class="py-0.5">{{ calculateBMI() }} kg/m²</td>
                  </tr>
                  <tr v-if="prescription.pulse_rate">
                    <td class="py-0.5">Pulse Rate:</td>
                    <td class="py-0.5">{{ prescription.pulse_rate }} bpm</td>
                  </tr>
                  <tr v-if="prescription.systolic_pressure">
                    <td class="py-0.5">Blood Pressure:</td>
                    <td class="py-0.5">{{ prescription.systolic_pressure }}/{{ prescription.diastolic_pressure || '' }} mmHg</td>
                  </tr>
                  <tr v-if="prescription.respiratory">
                    <td class="py-0.5">Respiratory:</td>
                    <td class="py-0.5">{{ prescription.respiratory }} b/m</td>
                  </tr>
                  <tr v-if="prescription.body_temp">
                    <td class="py-0.5">Body temp:</td>
                    <td class="py-0.5">{{ prescription.body_temp }} °F</td>
                  </tr>
                  <tr v-if="prescription.body_fat_percent">
                    <td class="py-0.5">Body Fat:</td>
                    <td class="py-0.5">{{ prescription.body_fat_percent }} %</td>
                  </tr>
                  <tr v-if="!prescription.current_height_feet && !prescription.current_weight && !prescription.pulse_rate && !prescription.systolic_pressure && !prescription.respiratory && !prescription.body_temp && !prescription.body_fat_percent">
                    <td class="py-0.5">No observations recorded</td>
                  </tr>
                </table>
              </div>
              <div v-if="diseaseHistories.length > 0" class="mb-6">
                <h3 class="font-bold text-lg mb-1">Dx:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li v-for="(history, index) in diseaseHistories" :key="'dx-' + index">{{ history.chief_complaint }}</li>
                </ol>
              </div>
              <div v-if="investigations.length > 0" class="mb-6">
                <h3 class="font-bold text-lg mb-1">Investigation:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li v-for="(test, index) in investigations" :key="index">
                    {{ test.test_name }}
                    <span v-if="test.comment">({{ test.comment }})</span>
                  </li>
                </ol>
              </div>
            </div>

            <!-- Right Column -->
            <div class="prescription-right-column md:col-span-9 border-l border-[#269E9A] pl-8">
              <div class="flex items-center mb-2">
                <i class="fas fa-prescription text-3xl text-gray-300 mr-2"></i>
              </div>
              <div>
                <div v-for="(medicine, index) in prescribedMedicines" :key="medicine.id" class="mb-2">
                  <div class="flex border-b border-gray-200">
                    <span class="mr-2">{{ index + 1 }}.</span>
                    <div class="flex-grow">
                      <p>{{ medicine.x_medicine_name }}</p>
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-1">
                        <div>{{ medicine.dosage }}</div>
                        <div>{{ medicine.medicine_meal }}</div>
                        <div>{{ medicine.medication_duration === '0' ? 'As needed' : medicine.medication_duration }}</div>
                        <div>{{ medicine.comment || '' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="prescribedMedicines.length === 0" class="text-gray-500 text-sm">
                  No medicines prescribed
                </div>
              </div>
              <div v-if="therapies.length > 0" class="mt-6 ml-0 md:ml-8">
                <h3 class="font-bold text-lg mb-1">Therapy:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li v-for="(therapy, index) in therapies" :key="index">
                    {{ therapy.therapy_name }}
                    <span v-if="therapy.frequency">({{ therapy.frequency }})</span>
                    <span v-if="therapy.comment"> - {{ therapy.comment }}</span>
                  </li>
                </ol>
              </div>
              
              <!-- IPD Admission Section -->
              <div v-if="showIpdAdmission" class="mt-6 ml-0 md:ml-8">
                <h3 class="font-bold text-lg mb-1" v-if="advices.length === 0">Advice:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li>Admission in IPD for {{ ipdAdmission.admission_days }} days</li>
                </ol>
              </div>

              <div v-if="advices.length > 0" class="mt-6 ml-0 md:ml-8">
                <h3 class="font-bold text-lg mb-1">Advice:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li v-for="(advice, index) in advices" :key="'advice-' + index">{{ advice }}</li>
                  <!-- Add IPD admission as additional advice if advices exist -->
                  <li v-if="showIpdAdmission">Admission in IPD for {{ ipdAdmission.admission_days }} days</li>
                </ol>
              </div>
              
              <div v-if="prescription.next_visit_date" class="mt-6 ml-0 md:ml-8">
                <h3 class="font-bold text-lg mb-1">Follow-up:</h3>
                <p class="text-sm">Next visit: {{ formatDate(prescription.next_visit_date) }} (in {{ prescription.follow_up_number }} {{ prescription.follow_up_type }})</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-600">
          <p>No prescription data available. Please try again.</p>
        </div>
      </div>

      <!-- Prescription Footer -->
      <div class="prescription-footer-container absolute bottom-0 left-0 w-full z-10">
        <div class="background-image"></div>
        <div class="prescription-footer bg-[#269E9A] text-white pt-4 pb-4">
          <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-8">
            <div class="md:col-span-3 text-right">
              <p style="font-size: 1.6rem" class="font-bold">AMERICAN</p>
              <p style="font-size: 0.9rem;" class="font-bold">WELLNESS CENTER</p>
            </div>
            <div class="md:col-span-9 mt-2">
              <p style="font-size: 0.9rem;">Islam Tower, 2nd & 3rd Floor, Sukrabad Bus Stand, Dhanmondi-32, Dhaka-1207.</p>
              <p style="font-size: 1rem;" class="font-bold">For Appointment: +88 09666747470 (BD), E-mail: acrhbd@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  <!-- Action Buttons -->
  <div class="flex justify-center gap-4 mt-6 mb-6">
    <button @click="downloadPrescription" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 prescription-download-button">
      <i class="fas fa-download"></i> Download PDF
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
const advices = computed(() => {
  if (prescription.value.advices) {
    return prescription.value.advices.split(',').map(a => a.trim())
  }
  return []
})
const therapies = computed(() => prescriptionData.value?.prescribed_therapies || [])
const investigations = computed(() => prescriptionData.value?.prescribed_tests || [])
const diseaseHistories = computed(() => prescriptionData.value?.disease_histories || [])
const ipdAdmission = computed(() => prescriptionData.value?.ipd_admission || {})

// Check if IPD admission should be shown
const showIpdAdmission = computed(() => {
  return ipdAdmission.value && ipdAdmission.value.is_ipd_admission == 1
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}

// Capitalize first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Calculate BMI
const calculateBMI = () => {
  if (!prescription.value.current_height_feet || !prescription.value.current_weight) return 'N/A'
  const height_cm = (prescription.value.current_height_feet * 30.48) + (prescription.value.current_height_inches * 2.54 || 0)
  const bmi = prescription.value.current_weight / Math.pow(height_cm / 100, 2)
  return bmi.toFixed(1)
}

// Generate barcode
const generateBarcode = (text) => {
  return API_URLS.barcode(text)
}

// Fetch prescription data
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

// Update downloadPrescription function
const downloadPrescription = async () => {
  if (!prescriptionData.value) {
    console.error('No prescription data available for PDF generation');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Create a temporary div for PDF generation
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.height = '297mm';
  document.body.appendChild(tempDiv);

  // Clone the prescription container
  const element = document.querySelector('.prescription-container').cloneNode(true);
  tempDiv.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
      logging: true
    });

    const imgData = canvas.toDataURL('image/png');
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save(`Prescription_${prescription.value.prescription_number || 'unknown'}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
  } finally {
    document.body.removeChild(tempDiv);
  }
};
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
  height: 297mm;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

.prescription-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 10;
}

.prescription-content {
  padding-top: 100px;
  padding-bottom: 80px;
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

.prescription-footer-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}

.prescription-footer {
  width: 100%;
  background: #269E9A;
}

.background-image {
  position: absolute;
  bottom: 120px;
  left: 140px;
  width: 400px;
  height: 400px;
  background-image: url('/bg-image.png');
  background-repeat: no-repeat;
  background-size: contain;
  transform: rotate(45deg);
  transform-origin: left top;
  opacity: 0.2;
  z-index: 1;
  pointer-events: none;
}

@media screen and (max-width: 768px) {
  .prescription-page-toolbar { width: min(100% - 1.5rem, 840px); align-items: flex-start; flex-direction: column; }
  .prescription-wrapper { width: 100%; max-width: 100%; overflow-x: hidden; }
  .prescription-container { width: 100%; height: auto; min-height: 0; margin: 0; overflow: visible; }
  .prescription-header,
  .prescription-footer-container { position: relative; }
  .prescription-header { z-index: 1; }
  .prescription-content { padding: 1rem !important; }
  .prescription-loading { min-height: 300px; padding: 2.5rem 1rem; }
  .doctor-info { flex-direction: column; gap: .75rem; }
  .doctor-details { width: 100%; text-align: left !important; }
  .doctor-details h2 { font-size: 1.25rem; overflow-wrap: anywhere; }
  .clinic-logo img { max-width: 170px; height: auto; }
  .prescription-patient-info { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 1rem !important; padding: 1rem !important; gap: .75rem; }
  .prescription-patient-info > div { min-width: 0; overflow-wrap: anywhere; }
  .prescription-right-column { border-left: 0 !important; padding-left: 0 !important; margin-top: 1.5rem; }
  .prescription-footer-container { margin-top: 2rem; }
  .background-image { display: none; }
  .prescription-footer .grid { padding-left: 1rem; padding-right: 1rem; }
  .prescription-footer .text-right { text-align: left !important; }
  .prescription-footer p { overflow-wrap: anywhere; }
  .flex.justify-center.gap-4 { flex-wrap: wrap; }
}

@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .prescription-container {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    position: relative;
  }

  .prescription-header {
    position: absolute;
    top: 0;
  }

  .prescription-footer-container {
    position: absolute;
    bottom: 0;
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

  .row.mt-1 .col-md-1,
  .row.mt-1 .col-md-5,
  .row.mt-1 .col-md-4,
  .row.mt-1 .col-md-2,
  .col-md-8,
  .col-md-4,
  span,
  li,
  p,
  td {
    font-size: 11px !important;
  }

  #medicine_section {
    min-height: 400px;
    margin-left: 30px !important;
  }

  .text-right {
    text-align: right !important;
  }
}
</style>
