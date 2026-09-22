<template>
  <div class="dashboard-two-column">
    <!-- Lab Reports Column -->
    <section id="reports" class="dashboard-section" aria-labelledby="reports-title">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Records</p>
          <h2 id="reports-title">Lab reports</h2>
        </div>
        <span class="section-meta">{{ reports.length }} total</span>
      </div>
      <div class="dashboard-panel record-panel">
        <div v-if="!reports.length" class="empty-inline">
          No laboratory reports are available yet.
        </div>
        <div
          v-for="report in reports.slice(0, 5)"
          :key="report.id"
          class="record-row"
        >
          <div class="record-icon" aria-hidden="true">
            <i class="fas fa-file-medical"></i>
          </div>
          <div class="record-main">
            <strong>{{ formatReportTitle(report) }}</strong>
            <span>{{ formatDate(report.transaction_date) }}</span>
          </div>
          <span class="status-badge" :class="`status-${reportStatus(report)}`">
            {{ reportStatusLabel(report) }}
          </span>
          <RouterLink
            v-if="isReportCompleted(report.status)"
            class="icon-link"
            :to="{ name: 'Report', params: { id: report.transaction_id } }"
            :aria-label="`View ${report.invoice_no || 'lab report'}`"
          >
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Prescriptions Column -->
    <section id="prescriptions" class="dashboard-section" aria-labelledby="prescriptions-title">
      <div class="section-heading-row">
        <div>
          <p class="section-kicker">Treatment plan</p>
          <h2 id="prescriptions-title">Prescriptions</h2>
        </div>
        <span class="section-meta">{{ prescriptions.length }} total</span>
      </div>
      <div class="dashboard-panel record-panel">
        <div v-if="!prescriptions.length" class="empty-inline">
          No prescriptions are available yet.
        </div>
        <div
          v-for="prescription in prescriptions.slice(0, 5)"
          :key="prescription.id"
          class="record-row"
        >
          <div class="record-icon record-icon-teal" aria-hidden="true">
            <i class="fas fa-prescription-bottle-medical"></i>
          </div>
          <div class="record-main">
            <strong>{{ prescription.prescription_number || `Prescription ${prescription.id}` }}</strong>
            <span>{{ formatDate(prescription.visit_date || prescription.prescription_date) }}</span>
          </div>
          <span class="status-badge status-recorded">{{ prescription.status || 'Recorded' }}</span>
          <RouterLink
            class="icon-link"
            :to="{ name: 'Prescription', params: { id: prescription.id } }"
            :aria-label="`View ${prescription.prescription_number || 'prescription'}`"
          >
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  prescriptions: {
    type: Array,
    default: () => []
  }
})

const formatDate = (value) => {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatReportTitle = (report) => {
  if (!report) return 'Lab Report'
  const inv = report.invoice_no
  if (inv) {
    const invStr = String(inv).trim()
    if (/^(report|invoice|inv|#)/i.test(invStr)) {
      return invStr
    }
    return `Report #${invStr}`
  }
  return `Report #${report.id || report.transaction_id || ''}`
}

const isReportCompleted = status => ['completed', 'finalized', 'finalised', 'ready'].includes(String(status ?? '').trim().toLowerCase())
const isReportReady = report => isReportCompleted(report?.status) || Boolean(report?.finalized_at)
const reportStatus = report => isReportReady(report) ? 'ready' : 'pending'
const reportStatusLabel = report => reportStatus(report) === 'ready' ? 'Ready to view' : 'In progress'
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

#reports, #prescriptions {
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
.section-meta { color: #718695; font-size: .78rem; font-weight: 600; }

.dashboard-panel { 
  min-width: 0; 
  border: 1px solid #dce6e8; 
  border-radius: 20px; 
  background: rgba(255, 255, 255, .94); 
  box-shadow: 0 10px 28px rgba(15, 59, 89, .05); 
}

.record-panel { padding: .4rem 1.15rem; }
.record-row { 
  display: grid; 
  grid-template-columns: auto minmax(0, 1fr) auto auto; 
  align-items: center; 
  gap: .75rem; 
  padding: .9rem 0; 
  border-bottom: 1px solid #e6eef0; 
}
.record-row:last-child { border-bottom: 0; }
.record-icon { 
  display: grid; 
  place-items: center; 
  width: 34px; 
  height: 34px; 
  border-radius: 10px; 
  color: #165b72; 
  background: #e3f1f4; 
}
.record-icon-teal { color: #0f766e; background: #dff5f1; }
.record-main { min-width: 0; }
.record-main strong, .record-main span { display: block; }
.record-main strong { color: #294e62; font-size: .85rem; overflow-wrap: anywhere; }
.record-main span { margin-top: .24rem; color: #82939d; font-size: .72rem; }

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
.status-ready, .status-recorded { color: #0f766e; background: #dff5f1; }
.status-pending { color: #a16207; background: #fff2c7; }

.icon-link { 
  display: grid; 
  place-items: center; 
  width: 36px; 
  height: 36px; 
  border-radius: 8px; 
  color: #0f766e; 
  font-size: .9rem; 
  text-decoration: none; 
  transition: background-color .15s ease;
}
.icon-link:hover { background: #eef8f6; }

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
  .dashboard-panel { border-radius: 16px; }
  .record-row { 
    grid-template-columns: auto minmax(0, 1fr) auto; 
    gap: 0.65rem;
  }
  .record-row .status-badge { 
    grid-column: 2; 
    grid-row: 2; 
    justify-self: start; 
  }
  .record-row .icon-link { 
    grid-column: 3; 
    grid-row: 1 / span 2; 
    width: 38px; 
    height: 38px; 
    background: #eef8f6; 
  }
}
</style>
