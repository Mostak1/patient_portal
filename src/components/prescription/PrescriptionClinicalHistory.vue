<template>
  <div class="prescription-clinical-history md:col-span-3">
    <!-- Chief Complaints -->
    <div class="mb-6">
      <h3 class="font-bold text-lg mb-1">C/C:</h3>
      <p class="text-sm">
        <span v-for="(complaint, index) in chiefComplaints" :key="index">
          {{ complaint }}<br v-if="index < chiefComplaints.length - 1">
        </span>
        <span v-if="chiefComplaints.length === 0">No complaints recorded</span>
      </p>
    </div>

    <!-- Observations & Vitals -->
    <div class="mb-6">
      <h3 class="font-bold text-lg mb-1">O/E:</h3>
      <table class="w-full text-sm">
        <tbody>
          <tr v-if="prescription.current_height_feet">
            <td class="py-0.5">Height:</td>
            <td class="py-0.5">
              {{ prescription.current_height_feet }} ft
              <span v-if="prescription.current_height_inches">{{ prescription.current_height_inches }}"</span>
            </td>
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
          <tr v-if="!hasObservations">
            <td class="py-0.5">No observations recorded</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Diagnoses -->
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
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  prescription: {
    type: Object,
    default: () => ({})
  },
  chiefComplaints: {
    type: Array,
    default: () => []
  },
  diseaseHistories: {
    type: Array,
    default: () => []
  },
  investigations: {
    type: Array,
    default: () => []
  }
})

const hasObservations = computed(() => {
  return Boolean(
    props.prescription.current_height_feet ||
    props.prescription.current_weight ||
    props.prescription.pulse_rate ||
    props.prescription.systolic_pressure ||
    props.prescription.respiratory ||
    props.prescription.body_temp ||
    props.prescription.body_fat_percent
  )
})

const calculateBMI = () => {
  if (!props.prescription.current_height_feet || !props.prescription.current_weight) return 'N/A'
  const height_cm = (props.prescription.current_height_feet * 30.48) + (props.prescription.current_height_inches * 2.54 || 0)
  const bmi = props.prescription.current_weight / Math.pow(height_cm / 100, 2)
  return bmi.toFixed(1)
}
</script>
