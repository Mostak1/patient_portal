<template>
  <section id="overview" class="dashboard-section" aria-labelledby="overview-title">
    <div class="section-heading-row">
      <div>
        <p class="section-kicker">Latest activity</p>
        <h2 id="overview-title">Your care timeline</h2>
      </div>
      <span class="section-meta">{{ formatDate(latestVisitDate) }}</span>
    </div>

    <div class="timeline-panel dashboard-panel">
      <div v-if="!latestReport" class="empty-state">
        <span class="empty-icon" aria-hidden="true"><i class="fas fa-clipboard-list"></i></span>
        <div>
          <h3>No report timeline yet</h3>
          <p>When a report is linked to your profile, its progress will appear here.</p>
        </div>
      </div>
      <ol v-else class="care-timeline">
        <li v-for="step in reportProgress" :key="step.key" :class="`timeline-${step.state}`">
          <span class="timeline-marker" aria-hidden="true">
            <i :class="stepIcon(step.state)"></i>
          </span>
          <div>
            <strong>{{ step.label }}</strong>
            <span>{{ step.detail }}</span>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
defineProps({
  latestReport: {
    type: Object,
    default: null
  },
  latestVisitDate: {
    type: String,
    default: ''
  },
  reportProgress: {
    type: Array,
    default: () => []
  }
})

const formatDate = (value) => {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const stepIcon = (state) => {
  return { complete: 'fas fa-check', current: 'fas fa-circle', 'not-recorded': 'fas fa-minus' }[state] || 'fas fa-minus'
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

.timeline-panel { padding: 1.45rem 1.35rem; }
.care-timeline { 
  display: grid; 
  grid-template-columns: repeat(3, minmax(0, 1fr)); 
  gap: 0; 
  margin: 0; 
  padding: 0; 
  list-style: none; 
}
.care-timeline li { 
  position: relative; 
  display: grid; 
  justify-items: center; 
  gap: .7rem; 
  padding: 0 .55rem; 
  text-align: center; 
}
.care-timeline li:not(:last-child)::after { 
  position: absolute; 
  top: 16px; 
  left: calc(50% + 17px); 
  width: calc(100% - 34px); 
  height: 2px; 
  content: ''; 
  background: #d6e4e7; 
}
.care-timeline li.timeline-complete:not(:last-child)::after { background: #7bcfc4; }

.timeline-marker { 
  position: relative; 
  z-index: 1; 
  display: grid; 
  place-items: center; 
  width: 34px; 
  height: 34px; 
  border: 5px solid #fff; 
  border-radius: 50%; 
  color: #fff; 
  background: #b7c8ce; 
  box-shadow: 0 0 0 1px #d1dfe2; 
  font-size: .72rem; 
}
.timeline-complete .timeline-marker { background: #0f766e; box-shadow: 0 0 0 1px #6bc8bd; }
.timeline-current .timeline-marker { color: #0f766e; background: #d6f3ee; box-shadow: 0 0 0 2px #0f766e; }

.care-timeline strong, .care-timeline span { display: block; }
.care-timeline strong { color: #26485d; font-size: .82rem; }
.care-timeline li > div > span { margin-top: .25rem; color: #7a8e98; font-size: .72rem; line-height: 1.45; }

.empty-state { 
  display: flex; 
  align-items: center; 
  gap: 1.15rem; 
  padding: 2.25rem 1.65rem; 
  text-align: left; 
}
.empty-icon { 
  display: grid; 
  place-items: center; 
  width: 48px; 
  height: 48px; 
  border-radius: 14px; 
  color: #0f766e; 
  background: #e6f6f4; 
  font-size: 1.35rem; 
}
.empty-state h3 { margin: 0 0 .25rem; color: #163b59; font-size: 1.05rem; font-weight: 750; }
.empty-state p { margin: 0; color: #718695; font-size: .88rem; line-height: 1.5; }

@media (max-width: 640px) {
  .section-heading-row { 
    align-items: flex-start; 
    flex-direction: column; 
    gap: .35rem; 
  }
  .section-heading-row h2 {
    font-size: 1.22rem;
  }
  .dashboard-panel { 
    padding: 1.15rem 1rem; 
    border-radius: 16px;
  }
  .care-timeline { 
    display: grid; 
    grid-template-columns: 1fr !important; 
    gap: 1.1rem; 
    justify-items: start; 
  }
  .care-timeline li { 
    grid-template-columns: auto 1fr; 
    justify-items: start; 
    gap: .85rem; 
    padding: 0; 
    text-align: left; 
  }
  .care-timeline li:not(:last-child)::after { 
    top: 34px; 
    left: 16px; 
    width: 2px; 
    height: calc(100% - 18px); 
  }
  .care-timeline strong { padding-top: .25rem; }
}
</style>
