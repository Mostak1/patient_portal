<template>
  <div class="prescription-container bg-white p-6 max-w-4xl mx-auto">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center text-gray-600">
      <p>Loading prescription data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-600">
      <p>{{ error }}</p>
    </div>

    <!-- Data Display -->
    <div v-else-if="prescriptionData" class="px-8">
      <!-- Doctor Info Header -->
      <div class="doctor-info flex justify-between items-start mb-8">
        <div class="clinic-logo">
          <img :src="businessLogo" alt="Clinic Logo" class="h-20 mt-4">
        </div>
        <div class="doctor-details text-right">
          <h2 class="text-2xl font-bold">{{ prescription.assigned_doctor_first_name }} {{
            prescription.assigned_doctor_last_name }}</h2>
          <div class="qualifications text-sm" v-html="prescription.show_in_pad"></div>
        </div>
      </div>

      <!-- Patient Info Section -->
      <div class="patient-info border border-black rounded-3xl py-4 px-6 mb-6 grid grid-cols-6 text-center">
        <div class="col-span-2">
          <p class="text-sm">Patient Name</p>
          <p class="font-bold">{{ prescription.patient_first_name }} {{ prescription.patient_last_name || '' }}
            {{ prescription.customerId ? '(' + prescription.customerId + ')' : '' }}</p>
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
          <!-- Chief Complaints -->
          <div class="mb-6">
            <h3 class="font-bold text-lg mb-1">C/C:</h3>
            <p class="text-sm">
              <span v-for="(history, index) in diseaseHistories" :key="index">
                {{ history.chief_complaint }}<br v-if="index < diseaseHistories.length - 1">
              </span>
              <span v-if="diseaseHistories.length === 0">No complaints recorded</span>
            </p>
          </div>

          <!-- Observations -->
          <div class="mb-6">
            <h3 class="font-bold text-lg mb-1">O/E:</h3>
            <table class="w-full text-sm">
              <tr v-if="prescription.current_height_feet">
                <td class="py-0.5">Height:</td>
                <td class="py-0.5">{{ prescription.current_height_feet }} ft <span
                    v-if="prescription.current_height_inches">{{ prescription.current_height_inches }}"</span></td>
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
                <td class="py-0.5">{{ prescription.systolic_pressure }}/{{ prescription.diastolic_pressure || '' }} mmHg
                </td>
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
              <tr v-if="!prescription.current_height_feet && !prescription.current_weight && !prescription.pulse_rate &&
                !prescription.systolic_pressure && !prescription.respiratory && !prescription.body_temp &&
                !prescription.body_fat_percent">
                <td class="py-0.5">No observations recorded</td>
              </tr>
            </table>
          </div>

          <!-- Diagnosis -->
          <div v-if="diseaseHistories.length > 0" class="mb-6">
            <h3 class="font-bold text-lg mb-1">Dx:</h3>
            <ol class="list-decimal pl-5 text-sm">
              <li v-for="(history, index) in diseaseHistories" :key="'dx-' + index">{{ history.chief_complaint }}</li>
            </ol>
          </div>

          <!-- Investigations -->
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
          <!-- Prescription Icon -->
          <div class="flex items-center mb-2">
            <i class="fas fa-prescription text-3xl text-gray-300 mr-2"></i>
          </div>

          <!-- Medicines -->
          <div>
            <div v-for="(medicine, index) in prescribedMedicines" :key="medicine.id" class="mb-2">
              <div class="flex border-b border-gray-200">
                <span class="mr-2">{{ index + 1 }}.</span>
                <div class="flex-grow">
                  <p>{{ medicine.x_medicine_name }}</p>
                  <div class="grid grid-cols-4 gap-2 text-sm mt-1">
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

          <!-- Therapies -->
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

          <!-- Advice -->
          <div v-if="advices.length > 0" class="mt-6 ml-8">
            <h3 class="font-bold text-lg mb-1">Advice:</h3>
            <ol class="list-decimal pl-5 text-sm">
              <li v-for="(advice, index) in advices" :key="'advice-' + index">{{ advice }}</li>
            </ol>
          </div>

          <!-- Follow-up -->
          <div v-if="prescription.next_visit_date" class="mt-6 ml-8">
            <h3 class="font-bold text-lg mb-1">Follow-up:</h3>
            <p class="text-sm">Next visit: {{ formatDate(prescription.next_visit_date) }} (in {{
              prescription.follow_up_number }} {{ prescription.follow_up_type }})</p>
          </div>
        </div>
      </div>
      <div class="background-image"></div>
      <!-- Prescription Footer -->
      <div class="prescription-footer-container">
        <div class="prescription-footer bg-[#269E9A] text-white mt-12 pt-4 pb-4">
          <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-8">
            <!-- Left Column -->
            <div class="md:col-span-3 text-right">
              <p style="font-size: 1.6rem" class="font-bold">AMERICAN</p>
              <p style="font-size: 0.9rem;" class="font-bold"> WELLNESS CENTER</p>
            </div>

            <!-- Right Column -->
            <div class="md:col-span-9 mt-2">
              <p style="font-size: 1rem;">Islam Tower, 2nd & 3rd Floor, Sukrabad Bus Stand, Dhanmondi-32, Dhaka-1207.</p>
              <p style="font-size: 1.1rem;" class="font-bold">For Appointment: +88 09666747470 (BD), E-mail: acrhbd@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center text-gray-600">
      <p>No prescription data available. Please try again.</p>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex justify-center gap-4 mt-8">
    <button @click="printPrescription"
      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
      <i class="fas fa-print"></i> Print
    </button>
    <button @click="downloadPrescription"
      class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
      <i class="fas fa-download"></i> Download PDF
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import jsPDF from 'jspdf'

const route = useRoute()
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
  return date.toLocaleDateString('en-GB') // DD/MM/YYYY format
}

const capitalizeFirstLetter = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Calculate BMI
const calculateBMI = () => {
  if (!prescription.value.current_height_feet || !prescription.value.current_weight) return 'N/A'

  const height_cm = (prescription.value.current_height_feet * 30.48) +
    (prescription.value.current_height_inches * 2.54 || 0)
  const bmi = prescription.value.current_weight / Math.pow(height_cm / 100, 2)
  return bmi.toFixed(1)
}

// Generate barcode (mock implementation - you'll need a proper barcode generator)
const generateBarcode = (text) => {
  // In a real implementation, you would use a barcode generation library
  // This is just a placeholder
  return `https://barcode.tec-it.com/barcode.ashx?data=${text}&code=Code128&dpi=96`
}

// Fetch data if not available in route state
const fetchPrescriptionData = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await axios.get('http://localhost/Projects/Lacuna_main_only/public/api/prescriptions/by-details', {
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

// Load data
onMounted(() => {
  if (route.state && route.state.prescriptionData) {
    prescriptionData.value = route.state.prescriptionData
  } else if (route.params.id && route.query.mobile) {
    fetchPrescriptionData()
  } else {
    error.value = 'No prescription data or parameters provided.'
  }
})

// Print function
const printPrescription = () => {
  window.print()
}

// Download as PDF function
const downloadPrescription = () => {
  if (!prescriptionData.value) {
    console.error('No prescription data available for PDF generation')
    return
  }

  const doc = new jsPDF()
  const margin = 10
  let y = 10

  // Header
  doc.setFontSize(16)
  doc.text('AMERICAN WELLNESS CENTER', 105, y, { align: 'center' })
  y += 10
  doc.setFontSize(10)
  doc.text('Islam Tower, 2nd & 3rd Floor, Sukrabad Bus Stand, Dhanmondi-32, Dhaka-1207', 105, y, { align: 'center' })
  y += 10

  // Doctor Info
  doc.setFontSize(12)
  doc.text(`${prescription.value.assigned_doctor_first_name} ${prescription.value.assigned_doctor_last_name}`, 200, y, { align: 'right' })
  y += 7
  doc.setFontSize(10)
  doc.text(prescription.value.show_in_pad?.replace(/<[^>]+>/g, '') || 'N/A', 200, y, { align: 'right' })
  y += 15

  // Patient Info
  doc.setFontSize(10)
  doc.text(`Patient: ${prescription.value.patient_first_name} ${prescription.value.patient_last_name || ''} ${prescription.value.customerId ? '(' + prescription.value.customerId + ')' : ''}`, margin, y)
  y += 7
  doc.text(`Age: ${prescription.value.age || 'N/A'}`, margin, y)
  doc.text(`Sex: ${capitalizeFirstLetter(prescription.value.gender) || 'N/A'}`, 70, y)
  doc.text(`Date: ${formatDate(prescription.value.visit_date)}`, 130, y)
  y += 15

  // Chief Complaints
  doc.setFontSize(12)
  doc.text('Chief Complaints:', margin, y)
  y += 7
  doc.setFontSize(10)
  if (diseaseHistories.value.length > 0) {
    diseaseHistories.value.forEach((history) => {
      doc.text(`- ${history.chief_complaint}`, margin + 5, y)
      y += 7
    })
  } else {
    doc.text('- No complaints recorded', margin + 5, y)
    y += 7
  }
  y += 10

  // Observations
  doc.setFontSize(12)
  doc.text('Observations:', margin, y)
  y += 7
  doc.setFontSize(10)

  if (prescription.value.current_height_feet) {
    doc.text(`Height: ${prescription.value.current_height_feet} ft${prescription.value.current_height_inches ? ' ' + prescription.value.current_height_inches + '"' : ''}`, margin + 5, y)
    y += 7
  }
  if (prescription.value.current_weight) {
    doc.text(`Weight: ${prescription.value.current_weight} kg`, margin + 5, y)
    y += 7
  }
  if (prescription.value.current_height_feet && prescription.value.current_weight) {
    doc.text(`BMI: ${calculateBMI()} kg/m²`, margin + 5, y)
    y += 7
  }
  if (prescription.value.pulse_rate) {
    doc.text(`Pulse Rate: ${prescription.value.pulse_rate} bpm`, margin + 5, y)
    y += 7
  }
  if (prescription.value.systolic_pressure) {
    doc.text(`Blood Pressure: ${prescription.value.systolic_pressure}/${prescription.value.diastolic_pressure || ''} mmHg`, margin + 5, y)
    y += 7
  }
  if (prescription.value.respiratory) {
    doc.text(`Respiratory: ${prescription.value.respiratory} b/m`, margin + 5, y)
    y += 7
  }
  if (prescription.value.body_temp) {
    doc.text(`Body temp: ${prescription.value.body_temp} °F`, margin + 5, y)
    y += 7
  }
  if (prescription.value.body_fat_percent) {
    doc.text(`Body Fat: ${prescription.value.body_fat_percent} %`, margin + 5, y)
    y += 7
  }
  if (!prescription.value.current_height_feet && !prescription.value.current_weight && !prescription.value.pulse_rate &&
    !prescription.value.systolic_pressure && !prescription.value.respiratory && !prescription.value.body_temp &&
    !prescription.value.body_fat_percent) {
    doc.text('- No observations recorded', margin + 5, y)
    y += 7
  }
  y += 10

  // Medicines
  doc.setFontSize(12)
  doc.text('Prescription:', margin, y)
  y += 7
  doc.setFontSize(10)
  if (prescribedMedicines.value.length > 0) {
    prescribedMedicines.value.forEach((medicine, index) => {
      doc.text(`${index + 1}. ${medicine.x_medicine_name}`, margin, y)
      y += 7
      doc.text(`   ${medicine.dosage || '-'} - ${medicine.medicine_meal || '-'} - ${medicine.medication_duration === '0' ? 'As needed' : medicine.medication_duration}${medicine.comment ? ' - ' + medicine.comment : ''}`, margin, y)
      y += 7
    })
  } else {
    doc.text('- No medicines prescribed', margin, y)
    y += 7
  }
  y += 10

  // Therapies
  if (therapies.value.length > 0) {
    doc.setFontSize(12)
    doc.text('Therapies:', margin, y)
    y += 7
    doc.setFontSize(10)
    therapies.value.forEach((therapy, index) => {
      doc.text(`${index + 1}. ${therapy.therapy_name}${therapy.frequency ? ` (${therapy.frequency})` : ''}${therapy.comment ? ` - ${therapy.comment}` : ''}`, margin, y)
      y += 7
    })
    y += 10
  }

  // Footer
  doc.setFontSize(10)
  doc.text('AMERICAN WELLNESS CENTER', 105, y, { align: 'center' })
  y += 7
  doc.text('Islam Tower, 2nd & 3rd Floor, Sukrabad Bus Stand, Dhanmondi-32, Dhaka-1207', 105, y, { align: 'center' })
  y += 7
  doc.text('For Appointment: +88 09666747470 (BD), E-mail: acrhbd@gmail.com', 105, y, { align: 'center' })

  // Save PDF
  doc.save(`Prescription_${prescription.value.prescription_number || 'unknown'}.pdf`)
}
</script>

<style scoped>
.prescription-container {
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  position: relative;
}

.prescription-footer-container {
  margin-left: -3.5rem;
  margin-right: -3.5rem;
  margin-bottom: -2rem;
  width: calc(100% + 7rem);
}

.background-image {
  position: absolute;
  top: 650px;
  left: 160px; /* Adjust based on your image size */
  width: 400px; /* Adjust based on your needs */
  height: 40%; /* Extend beyond container */
  background-image: url('/bg-image.png');
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.2;
  transform: rotate(45deg);
  transform-origin: left top;
  z-index: 1;
  pointer-events: none; /* Allows clicking through the image */
}

.prescription-footer {
  width: 100%;
}

@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .prescription-container {
    width: 100%;
    padding: 0;
    margin: 0;
  }

  button {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 10mm;
  }

  .prescription-footer-container {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
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