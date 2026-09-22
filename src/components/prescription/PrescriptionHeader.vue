<template>
  <div class="prescription-header w-full bg-white">
    <div class="max-w-4xl mx-auto px-6 py-3">
      <div class="doctor-info flex justify-between items-start">
        <div class="clinic-logo">
          <img :src="logoUrl" alt="Clinic Logo" class="h-16">
        </div>
        <div class="doctor-details text-right">
          <h2 class="text-xl font-bold">{{ prescription.assigned_doctor_first_name }} {{ prescription.assigned_doctor_last_name }}</h2>
          <div class="qualifications text-xs text-gray-700" v-html="prescription.show_in_pad"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  prescription: {
    type: Object,
    default: () => ({})
  },
  logoUrl: {
    type: String,
    default: '/awc_logo.png'
  }
})
</script>

<style scoped>
.prescription-header {
  position: relative;
  width: 100%;
  background: white;
  z-index: 2;
  border-bottom: 1.5px solid #e5e7eb;
}
.qualifications :deep(p),
.qualifications :deep(div) {
  margin: 0;
  line-height: 1.35;
}
</style>
