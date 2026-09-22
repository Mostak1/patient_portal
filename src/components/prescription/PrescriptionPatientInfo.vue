<template>
  <div class="prescription-patient-info patient-info border border-black rounded-2xl py-2 px-4 mb-4 grid grid-cols-6 text-center mt-1 text-xs">
    <div class="col-span-2">
      <p class="text-sm">Patient Name</p>
      <p class="font-bold">
        {{ prescription.patient_first_name }} {{ prescription.patient_last_name || '' }}
        {{ prescription.customerId ? '(' + prescription.customerId + ')' : '' }}
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
      <img v-if="prescription.customerId" :src="generateBarcode(prescription.customerId)" alt="Barcode" class="h-8">
    </div>
  </div>
</template>

<script setup>
import { API_URLS } from '../../config/api'

defineProps({
  prescription: {
    type: Object,
    default: () => ({})
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}

const capitalizeFirstLetter = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const generateBarcode = (text) => {
  return API_URLS.barcode(text)
}
</script>

<style scoped>
.prescription-patient-info {
  width: 100%;
}
</style>
