<template>
  <div class="prescription-wrapper">
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
        <div v-if="isLoading" class="text-center text-gray-600">
          <p>Loading prescription data...</p>
        </div>
        <div v-else-if="error" class="text-center text-red-600">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="prescriptionData">
          <!-- Patient Info Section -->
          <div class="patient-info border border-black rounded-3xl py-4 px-6 mb-6 grid grid-cols-6 text-center mt-10">
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
            <div class="md:col-span-9 border-l border-[#269E9A] pl-8">
              <div class="flex items-center mb-2">
                <i class="fas fa-prescription text-3xl text-gray-300 mr-2"></i>
              </div>
              <div>
                <div v-for="(medicine, index) in prescribedMedicines" :key="medicine.id" class="mb-2">
                  <div class="flex border-b border-gray-200">
                    <span class="mr-2">{{ index + 1 }}.</span>
                    <div class="flex-grow">
                      <p>{{ medicine.x_medicine_name }}</p>
                      <div class="grid grid-cols-3 gap-2 text-sm mt-1">
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
              <div v-if="therapies.length > 0" class="mt-6 ml-8">
                <h3 class="font-bold text-lg mb-1">Therapy:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li v-for="(therapy, index) in therapies" :key="index">
                    {{ therapy.therapy_name }}
                    <span v-if="therapy.frequency">({{ therapy.frequency }})</span>
                    <span v-if="therapy.comment"> - {{ therapy.comment }}</span>
                  </li>
                </ol>
              </div>
              <div v-if="advices.length > 0" class="mt-6 ml-8">
                <h3 class="font-bold text-lg mb-1">Advice:</h3>
                <ol class="list-decimal pl-5 text-sm">
                  <li v-for="(advice, index) in advices" :key="'advice-' + index">{{ advice }}</li>
                </ol>
              </div>
              <div v-if="prescription.next_visit_date" class="mt-6 ml-8">
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
  <div class="flex justify-center gap-4 mt-8">
    <button @click="handlePrint" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
      <i class="fas fa-print"></i> Print
    </button>
    <button @click="downloadPrescription" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
      <i class="fas fa-download"></i> Download PDF
    </button>
  </div>
    <!-- Add this hidden div for printing -->
  <div v-if="showPrintView" class="fixed inset-0 z-50 overflow-auto bg-white print:bg-transparent">
    <PrescriptionPrint 
      v-if="showPrintView" 
      :prescriptionData="prescriptionData"
      @close="handlePrintClose"
    />
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()
const prescriptionData = ref(null)
const businessLogo = ref('/awc_logo.png')
const isLoading = ref(false)
const error = ref('')

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
  return `https://barcode.tec-it.com/barcode.ashx?data=${text}&code=Code128&dpi=96`
}

// Fetch prescription data
const fetchPrescriptionData = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await axios.get('https://awc.careneterp.com:83/api/prescriptions/by-details', {
      params: {
        mobile_number: route.query.mobile,
        invoice_number: route.params.id
      }
    })
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
  } else if (route.params.id && route.query.mobile) {
    fetchPrescriptionData()
  } else {
    error.value = 'No prescription data or parameters provided.'
  }
})


import PrescriptionPrint from './PrescriptionPrint.vue';

const showPrintView = ref(false);

const handlePrint = () => {
  showPrintView.value = true;
};

const handlePrintClose = () => {
  showPrintView.value = false;
};

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

.prescription-container {
  width: 210mm;
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