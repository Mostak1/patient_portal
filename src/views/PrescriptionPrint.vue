<template>
  <div class="print-container">
    <div class="prescription-container bg-white">
      <!-- Prescription Header -->
      <div style="top: -20px;" class="prescription-header absolute top-0 left-0 w-full bg-white z-10">
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
        <div v-if="!prescriptionData" class="text-center text-gray-600">
          <p>Loading prescription data...</p>
        </div>
        <div v-else>
          <!-- Patient Info Section -->
          <div class="patient-info border border-black rounded-3xl py-4 px-6 mb-6 grid grid-cols-6 text-center mt-10">
            <div class="col-span-2">
              <p class="text-sm">Patient Name</p>
              <p class="font-bold">{{ prescription.patient_first_name }} {{ prescription.patient_last_name || '' }} 
                <span v-if="prescription.customerId">({{ prescription.customerId }})</span>
              </p>
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
                  <template v-if="diseaseHistories.length > 0">
                    <span v-for="(history, index) in diseaseHistories" :key="index">
                      {{ history.chief_complaint }}<br v-if="index < diseaseHistories.length - 1">
                    </span>
                  </template>
                  <span v-else>No complaints recorded</span>
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
                  <tr v-if="!hasPhysicalExaminationData">
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

    <!-- Add close button for non-print view -->
    <button 
      v-if="!isPrinting"
      @click="closePrint"
      class="fixed top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
    >
      Close
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  prescriptionData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const businessLogo = ref('/awc_logo.png')
const isPrinting = ref(false)

// Computed properties
const prescription = computed(() => props.prescriptionData?.prescription || {})
const prescribedMedicines = computed(() => props.prescriptionData?.prescribed_medicines || [])
const advices = computed(() => {
  if (prescription.value.advices) {
    return prescription.value.advices.split(',').map(a => a.trim())
  }
  return []
})
const therapies = computed(() => props.prescriptionData?.prescribed_therapies || [])
const investigations = computed(() => props.prescriptionData?.prescribed_tests || [])
const diseaseHistories = computed(() => props.prescriptionData?.disease_histories || [])
const hasPhysicalExaminationData = computed(() => {
  return prescription.value.current_height_feet || 
         prescription.value.current_weight || 
         prescription.value.pulse_rate || 
         prescription.value.systolic_pressure || 
         prescription.value.respiratory || 
         prescription.value.body_temp || 
         prescription.value.body_fat_percent
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
  return `https://barcode.tec-it.com/barcode.ashx?data=${text}&code=Code128&dpi=96`
}

const closePrint = () => {
  emit('close')
}

onMounted(() => {
  if (props.prescriptionData) {
    setTimeout(() => {
      isPrinting.value = true
      window.print()
      isPrinting.value = false
    }, 100)
  }
})

// Handle after print event
window.onafterprint = () => {
  closePrint()
}
</script>

<style scoped>
.print-container {
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.prescription-container {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  background-color: white;
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
  padding-top: 7rem;
  padding-bottom: 5rem;
}

.patient-info {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
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

/* Print-specific styles */
@media print {
  .print-container {
    padding: 0;
    background: transparent;
  }
  
  button {
    display: none !important;
  }
  
  @page {
    size: A4;
    margin: 0 !important;
  }
  
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  
  .prescription-container {
    box-shadow: none;
    margin: 0 auto;
    width: 100%;
    height: auto;
  }

  /* Ensure proper spacing in print */
  .prescription-content {
    padding-top: 6rem;
    padding-bottom: 4rem;
  }

  /* Prevent page breaks inside important sections */
  .patient-info, .md\:col-span-3, .md\:col-span-9 {
    page-break-inside: avoid;
  }

  /* Adjust font sizes for print */
  .text-sm {
    font-size: 10pt !important;
  }
  
  .text-lg {
    font-size: 12pt !important;
  }
  
  .font-bold {
    font-weight: bold !important;
  }
}
</style>