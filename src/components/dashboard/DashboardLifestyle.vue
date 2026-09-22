<template>
  <div class="dashboard-two-column">
    <!-- Lifestyle Calculation -->
    <section id="lifestyle" class="dashboard-section" aria-labelledby="lifestyle-title">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Daily health</p>
          <h2 id="lifestyle-title">Lifestyle calculation</h2>
        </div>
        <span class="educational-label">Educational summary</span>
      </div>
      <div class="dashboard-panel lifestyle-panel">
        <div v-if="!lifestyleItems.length" class="empty-inline">
          No lifestyle measurements are recorded yet.
        </div>
        <div
          v-for="metric in lifestyleItems"
          :key="metric.key"
          class="lifestyle-row"
        >
          <div>
            <strong>{{ metric.label }}</strong>
            <span>{{ metric.note }}</span>
          </div>
          <strong class="lifestyle-value">
            {{ metric.value }} <small>{{ metric.unit }}</small>
          </strong>
        </div>
        <p class="disclaimer">These values are educational summaries of recorded information. They are not a diagnosis.</p>
      </div>
    </section>

    <!-- Food and Lifestyle Guidance -->
    <section class="dashboard-section" aria-labelledby="guidance-title">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Care team notes</p>
          <h2 id="guidance-title">Food and lifestyle guidance</h2>
        </div>
        <span class="educational-label">Clinician recorded</span>
      </div>
      <div class="dashboard-panel guidance-panel">
        <div v-if="!guidance.length" class="empty-inline">
          No food or lifestyle guidance is recorded yet.
        </div>
        <div
          v-for="(item, index) in guidance.slice(0, 6)"
          :key="`${item.text}-${index}`"
          class="guidance-row"
        >
          <span class="guidance-marker" aria-hidden="true">
            <i :class="item.type === 'Food' ? 'fas fa-leaf' : 'fas fa-person-walking'"></i>
          </span>
          <div>
            <strong>{{ item.type }}</strong>
            <p>{{ item.text }}</p>
            <small v-if="item.date">Recorded {{ formatDate(item.date) }}</small>
          </div>
        </div>
        <p class="disclaimer">Follow the plan provided by your care team and contact the clinic if you have questions.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  lifestyleItems: {
    type: Array,
    default: () => []
  },
  guidance: {
    type: Array,
    default: () => []
  }
})

const formatDate = (value) => {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.dashboard-two-column { 
  display: grid; 
  grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); 
  gap: 1.25rem; 
  margin-top: 1.25rem;
}

.dashboard-section { 
  display: grid; 
  gap: 1rem; 
  min-width: 0; 
  scroll-margin-top: 85px; 
}

#lifestyle {
  scroll-margin-top: 85px;
}

.section-heading-row { 
  display: flex; 
  align-items: end; 
  justify-content: space-between; 
  gap: 1rem; 
}
.section-heading-row h2 { 
  margin: .25rem 0 0; 
  color: #163b59; 
  font-size: 1.35rem; 
  letter-spacing: -.025em; 
  font-weight: 800;
}
.section-kicker { 
  margin: 0; 
  color: #0f766e; 
  font-size: .72rem; 
  font-weight: 800; 
  letter-spacing: .13em; 
  text-transform: uppercase; 
}

.dashboard-panel { 
  min-width: 0; 
  padding: 1.35rem; 
  border: 1px solid #dce6e8; 
  border-radius: 20px; 
  background: rgba(255, 255, 255, .94); 
  box-shadow: 0 10px 28px rgba(15, 59, 89, .05); 
}

.lifestyle-row { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  padding: .85rem 0; 
  border-bottom: 1px solid #e6eef0; 
}
.lifestyle-row:last-of-type { border-bottom: 0; }
.lifestyle-row strong { color: #26485d; font-size: .88rem; }
.lifestyle-row span { display: block; margin-top: .2rem; color: #82939d; font-size: .72rem; }
.lifestyle-value { color: #163b59; font-size: 1rem; white-space: nowrap; }
.lifestyle-value small { color: #6f828f; font-size: .72rem; }

.guidance-row { 
  display: grid; 
  grid-template-columns: auto 1fr; 
  gap: .9rem; 
  padding: .85rem 0; 
  border-bottom: 1px solid #e6eef0; 
}
.guidance-row:last-of-type { border-bottom: 0; }
.guidance-marker { 
  display: grid; 
  place-items: center; 
  width: 32px; 
  height: 32px; 
  border-radius: 10px; 
  color: #0f766e; 
  background: #e6f6f4; 
  font-size: .85rem; 
}
.guidance-row strong { color: #26485d; font-size: .84rem; }
.guidance-row p { margin: .2rem 0 0; color: #587080; font-size: .82rem; line-height: 1.5; }
.guidance-row small { display: block; margin-top: .25rem; color: #8a9ba5; font-size: .7rem; }

.disclaimer { 
  margin: 1rem 0 0; 
  padding-top: .85rem; 
  border-top: 1px dashed #dce6e8; 
  color: #82939d; 
  font-size: .72rem; 
  line-height: 1.5; 
}

.educational-label { 
  display: inline-flex; 
  align-items: center; 
  width: fit-content; 
  padding: .32rem .55rem; 
  border-radius: 7px; 
  color: #356579; 
  background: #e7f0f2; 
  font-size: .68rem; 
  font-weight: 750; 
  line-height: 1; 
}

.empty-inline { padding: 1.25rem 0; color: #728796; font-size: .86rem; text-align: center; }

@media (max-width: 900px) {
  .dashboard-two-column { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .section-heading-row { 
    align-items: flex-start; 
    flex-direction: column; 
    gap: .35rem; 
  }
  .section-heading-row h2 { font-size: 1.22rem; }
  .dashboard-panel { padding: 1.15rem 1rem; border-radius: 16px; }
}
</style>
