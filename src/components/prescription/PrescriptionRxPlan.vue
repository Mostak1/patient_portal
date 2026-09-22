<template>
  <div class="prescription-right-column md:col-span-9 border-l border-[#269E9A] pl-8">
    <div class="flex items-center mb-2">
      <i class="fas fa-prescription text-3xl text-gray-300 mr-2" aria-hidden="true"></i>
    </div>

    <!-- Medicines -->
    <div>
      <div v-for="(medicine, index) in prescribedMedicines" :key="medicine.id || index" class="mb-2">
        <div class="flex border-b border-gray-200 pb-1">
          <span class="mr-2 font-semibold">{{ index + 1 }}.</span>
          <div class="flex-grow">
            <p class="font-medium text-gray-900">{{ medicine.x_medicine_name }}</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-1 text-gray-700">
              <div>{{ medicine.dosage }}</div>
              <div>{{ medicine.medicine_meal }}</div>
              <div>{{ medicine.medication_duration === '0' ? 'As needed' : medicine.medication_duration }}</div>
              <div v-if="medicine.comment" class="col-span-2 sm:col-span-3 text-xs text-gray-600 italic">{{ medicine.comment }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="prescribedMedicines.length === 0" class="text-gray-500 text-sm py-1">
        No medicines prescribed
      </div>
    </div>

    <!-- Therapies -->
    <div v-if="therapies.length > 0" class="mt-4 ml-0 md:ml-8">
      <h3 class="font-bold text-base mb-1">Therapy:</h3>
      <ol class="list-decimal pl-5 text-sm">
        <li v-for="(therapy, index) in therapies" :key="index">
          {{ therapy.therapy_name }}
          <span v-if="therapy.frequency">({{ therapy.frequency }})</span>
          <span v-if="therapy.comment"> - {{ therapy.comment }}</span>
        </li>
      </ol>
    </div>

    <!-- IPD Admission Section -->
    <div v-if="showIpdAdmission && advices.length === 0" class="mt-4 ml-0 md:ml-8">
      <h3 class="font-bold text-base mb-1">Advice:</h3>
      <ol class="list-decimal pl-5 text-sm">
        <li>Admission in IPD for {{ ipdAdmission.admission_days }} days</li>
      </ol>
    </div>

    <!-- Advices -->
    <div v-if="advices.length > 0" class="mt-4 ml-0 md:ml-8">
      <h3 class="font-bold text-base mb-1">Advice:</h3>
      <ol class="list-decimal pl-5 text-sm">
        <li v-for="(advice, index) in advices" :key="'advice-' + index">{{ advice }}</li>
        <li v-if="showIpdAdmission">Admission in IPD for {{ ipdAdmission.admission_days }} days</li>
      </ol>
    </div>

    <!-- Follow-up -->
    <div v-if="prescription.next_visit_date" class="mt-4 ml-0 md:ml-8">
      <h3 class="font-bold text-base mb-1">Follow-up:</h3>
      <p class="text-sm">
        Next visit: {{ formatDate(prescription.next_visit_date) }}
        <span v-if="prescription.follow_up_number && prescription.follow_up_type">
          (in {{ prescription.follow_up_number }} {{ prescription.follow_up_type }})
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  prescription: {
    type: Object,
    default: () => ({})
  },
  prescribedMedicines: {
    type: Array,
    default: () => []
  },
  therapies: {
    type: Array,
    default: () => []
  },
  advices: {
    type: Array,
    default: () => []
  },
  showIpdAdmission: {
    type: Boolean,
    default: false
  },
  ipdAdmission: {
    type: Object,
    default: () => ({})
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}
</script>
