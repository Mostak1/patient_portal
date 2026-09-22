<template>
  <header class="dashboard-hero">
    <div class="hero-copy">
      <p class="section-kicker">Patient portal</p>
      <h1 id="dashboard-title">Good to see you, {{ patientName }}</h1>
    </div>
    <div class="patient-summary">
      <span>Patient ID</span>
      <strong>{{ patientId || 'Not recorded' }}</strong>
    </div>
  </header>
</template>

<script setup>
defineProps({
  patientName: {
    type: String,
    default: 'there'
  },
  patientId: {
    type: [String, Number],
    default: ''
  }
})
</script>

<style scoped>
.dashboard-hero { 
  display: flex; 
  align-items: flex-end; 
  justify-content: space-between; 
  gap: 2rem; 
  padding: clamp(1.8rem, 4.5vw, 3rem); 
  border-radius: 24px; 
  color: #f8fafc; 
  background: radial-gradient(circle at 86% 16%, rgba(45, 212, 191, .22), transparent 28%), linear-gradient(120deg, #102a43 0%, #163b59 57%, #0f766e 140%); 
  box-shadow: 0 18px 45px rgba(15, 59, 89, .16); 
}

.hero-copy { max-width: 42rem; }
.hero-copy h1 { 
  margin: .45rem 0 .7rem; 
  color: #fff; 
  font-size: clamp(1.8rem, 4vw, 3.25rem); 
  line-height: 1.05; 
  letter-spacing: -.045em; 
  text-wrap: balance; 
  font-weight: 800;
}

.section-kicker { 
  margin: 0; 
  color: #8be4d6; 
  font-size: .72rem; 
  font-weight: 800; 
  letter-spacing: .13em; 
  text-transform: uppercase; 
}

.patient-summary { 
  display: grid; 
  gap: .25rem; 
  min-width: 160px; 
  padding-left: 1.2rem; 
  border-left: 1px solid rgba(203, 213, 225, .28); 
}
.patient-summary span { 
  color: #b9cedd; 
  font-size: .75rem; 
}
.patient-summary strong { 
  color: #fff; 
  font-size: 1.1rem; 
  letter-spacing: .02em; 
}

@media (max-width: 900px) {
  .dashboard-hero { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 1.25rem;
  }
  .patient-summary { 
    width: 100%; 
    padding: .85rem 0 0; 
    border-top: 1px solid rgba(203, 213, 225, .28); 
    border-left: 0; 
  }
}

@media (max-width: 640px) {
  .dashboard-hero { 
    padding: 1.35rem 1.15rem; 
    border-radius: 18px;
  }
  .hero-copy h1 { 
    font-size: 1.65rem; 
    line-height: 1.15;
  }
}

@media (max-width: 380px) {
  .hero-copy h1 { font-size: 1.45rem; }
}
</style>
