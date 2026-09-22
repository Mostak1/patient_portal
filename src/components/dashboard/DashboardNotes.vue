<template>
  <section v-if="nonUrgentAlerts.length" class="dashboard-section" aria-labelledby="notes-title">
    <div class="section-heading-row">
      <div>
        <p class="section-kicker">Clinical notes</p>
        <h2 id="notes-title">Care team updates</h2>
      </div>
      <span class="section-meta">{{ nonUrgentAlerts.length }} update{{ nonUrgentAlerts.length === 1 ? '' : 's' }}</span>
    </div>
    <div class="notes-list">
      <article
        v-for="alert in nonUrgentAlerts"
        :key="alert.id || `${alert.created_at}-${alert.reason}`"
        class="note-card dashboard-panel"
      >
        <span class="status-badge" :class="`status-${alert.level}`">
          {{ alertLevelLabel(alert.level) }}
        </span>
        <div>
          <h3>{{ alert.title }}</h3>
          <p>{{ alert.reason }}</p>
          <small>{{ formatDate(alert.created_at) }} · {{ alert.source }}</small>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  nonUrgentAlerts: {
    type: Array,
    default: () => []
  }
})

const formatDate = (value) => {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const alertLevelLabel = (level) => {
  return { informational: 'Information', 'follow-up': 'Follow-up', attention: 'Follow-up' }[level] || 'Care note'
}
</script>

<style scoped>
.dashboard-section { 
  display: grid; 
  gap: 1rem; 
  min-width: 0; 
  scroll-margin-top: 85px; 
  margin-top: 1.25rem;
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
.section-meta { color: #718695; font-size: .78rem; font-weight: 600; }

.dashboard-panel { 
  min-width: 0; 
  padding: 1.35rem; 
  border: 1px solid #dce6e8; 
  border-radius: 20px; 
  background: rgba(255, 255, 255, .94); 
  box-shadow: 0 10px 28px rgba(15, 59, 89, .05); 
}

.notes-list { display: grid; gap: .85rem; }
.note-card { 
  display: grid; 
  grid-template-columns: auto 1fr; 
  align-items: flex-start; 
  gap: 1rem; 
  padding: 1.15rem 1.25rem; 
}
.note-card h3 { margin: 0 0 .25rem; color: #163b59; font-size: .96rem; font-weight: 750; }
.note-card p { margin: 0; color: #50677a; font-size: .86rem; line-height: 1.5; }
.note-card small { display: block; margin-top: .4rem; color: #8798a2; font-size: .72rem; }

.status-badge { 
  display: inline-flex; 
  align-items: center; 
  width: fit-content; 
  padding: .32rem .55rem; 
  border-radius: 7px; 
  font-size: .68rem; 
  font-weight: 750; 
  line-height: 1; 
}
.status-follow-up, .status-attention { color: #a16207; background: #fff2c7; }

@media (max-width: 640px) {
  .section-heading-row { 
    align-items: flex-start; 
    flex-direction: column; 
    gap: .35rem; 
  }
  .section-heading-row h2 { font-size: 1.22rem; }
  .dashboard-panel { padding: 1.15rem 1rem; border-radius: 16px; }
  .note-card { grid-template-columns: 1fr; gap: .6rem; }
}
</style>
