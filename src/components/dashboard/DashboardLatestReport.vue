<template>
  <section class="dashboard-section report-section" aria-labelledby="latest-report-title">
    <div class="section-heading-row">
      <div>
        <p class="section-kicker">Understand your results</p>
        <h2 id="latest-report-title">Latest report summary</h2>
      </div>
      <RouterLink
        v-if="latestReport && isReportReady(latestReport)"
        class="text-link"
        :to="{ name: 'Report', params: { id: latestReport.transaction_id } }"
      >
        View full report <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </RouterLink>
      <span v-else-if="latestReport" class="section-meta">Report still being prepared</span>
    </div>

    <div v-if="!latestReport" class="dashboard-panel empty-state">
      <span class="empty-icon" aria-hidden="true"><i class="fas fa-file-medical"></i></span>
      <div>
        <h3>Your latest report will appear here</h3>
        <p>There are no completed lab reports linked to this profile yet.</p>
      </div>
    </div>

    <div v-else class="latest-report-layout">
      <!-- Highlight Card -->
      <article class="latest-report-card dashboard-panel">
        <div class="report-card-topline">
          <span class="report-type"><i class="fas fa-vial" aria-hidden="true"></i> Laboratory report</span>
          <span class="status-badge" :class="`status-${reportStatus(latestReport)}`">
            {{ reportStatusLabel(latestReport) }}
          </span>
        </div>
        <h3>{{ formatReportTitle(latestReport) }}</h3>
        <p>
          {{ formatDate(latestReport.transaction_date) }}
          <span class="muted-separator">·</span>
          {{ latestReport.status || 'Report recorded' }}
        </p>
        <RouterLink
          v-if="isReportReady(latestReport)"
          class="button button-secondary"
          :to="{ name: 'Report', params: { id: latestReport.transaction_id } }"
        >
          Open full report
        </RouterLink>
        <span v-else class="pending-report-note">
          <i class="fas fa-hourglass-half" aria-hidden="true"></i> The care team is preparing this report.
        </span>
      </article>

      <!-- Key Results List -->
      <div class="result-summary-list dashboard-panel">
        <div class="panel-heading compact-heading">
          <h3>Key results</h3>
          <span class="section-meta">Based on recorded report values</span>
        </div>
        <div v-if="!latestResults.length" class="empty-inline">
          No result summary is available for this report.
        </div>
        <div
          v-for="result in latestResults"
          :key="`${result.name}-${result.result}`"
          class="result-summary-row"
        >
          <div>
            <strong>{{ result.name }}</strong>
            <span v-if="result.reference_value">Reference: {{ cleanReferenceValue(result.reference_value) }}</span>
          </div>
          <div class="result-value">
            <strong>{{ result.result || 'Recorded' }} <small>{{ result.unit }}</small></strong>
            <span class="status-text" :class="`status-text-${result.status}`">
              {{ resultStatusLabel(result.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  latestReport: {
    type: Object,
    default: null
  },
  latestResults: {
    type: Array,
    default: () => []
  }
})

const formatDate = (value) => {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const cleanReferenceValue = (value) => {
  if (!value) return ''
  let text = String(value)
  text = text.replace(/<br\s*\/?>/gi, ' | ')
  text = text.replace(/<\/(p|div|li|tr|h\d)>\s*<(p|div|li|tr|h\d)[^>]*>/gi, ' | ')
  text = text.replace(/<\/[^>]+>/g, ' ')
  text = text.replace(/<[^>]+>/g, '')
  text = text.replace(/&nbsp;/gi, ' ')
  text = text.replace(/&lt;/gi, '<')
  text = text.replace(/&gt;/gi, '>')
  text = text.replace(/&amp;/gi, '&')
  text = text.replace(/\s*\|\s*/g, ' | ')
  text = text.replace(/\s+/g, ' ')
  return text.trim().replace(/^\|\s*|\s*\|$/g, '')
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
const resultStatusLabel = status => ({ normal: 'Within recorded range', attention: 'Review with care team', urgent: 'Urgent review', recorded: 'Recorded' }[status] || 'Recorded')
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
.text-link { color: #0f766e; font-size: .82rem; font-weight: 750; text-decoration: none; }
.text-link:hover { color: #115e59; }

.dashboard-panel { 
  min-width: 0; 
  padding: 1.35rem; 
  border: 1px solid #dce6e8; 
  border-radius: 20px; 
  background: rgba(255, 255, 255, .94); 
  box-shadow: 0 10px 28px rgba(15, 59, 89, .05); 
}

.latest-report-layout { 
  display: grid; 
  grid-template-columns: minmax(200px, .72fr) minmax(0, 1.28fr); 
  gap: 1.25rem; 
}
.latest-report-card { 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  min-height: 224px; 
  background: #163b59; 
  border-color: #163b59; 
}
.latest-report-card h3 { margin: 1.2rem 0 .25rem; color: #fff; font-size: 1.25rem; }
.latest-report-card p { margin: 0 0 1.4rem; color: #bed0dc; font-size: .82rem; }
.report-type { color: #a7e6dc; font-size: .74rem; font-weight: 700; }

.result-summary-list { padding: 1.1rem 1.25rem; }
.compact-heading { 
  display: flex; 
  align-items: end; 
  justify-content: space-between; 
  margin-bottom: .6rem; 
}
.compact-heading h3 { margin: 0; color: #163b59; font-size: 1.05rem; }

.result-summary-row { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  padding: .8rem 0; 
  border-top: 1px solid #e6eef0; 
}
.result-summary-row > div:first-child { min-width: 0; }
.result-summary-row strong, .result-summary-row span { display: block; }
.result-summary-row > div:first-child strong { color: #294e62; font-size: .86rem; overflow-wrap: anywhere; }
.result-summary-row > div:first-child span { margin-top: .25rem; color: #84949d; font-size: .72rem; }
.result-value { text-align: right; white-space: nowrap; }
.result-value > strong { color: #163b59; font-size: .9rem; }
.result-value small { color: #7b8d98; font-size: .7rem; font-weight: 600; }

.status-text { margin-top: .25rem; font-size: .7rem; font-weight: 750; }
.status-text-normal { color: #0f766e; }
.status-text-attention { color: #a16207; }
.status-text-urgent { color: #b91c1c; }
.status-text-recorded { color: #718695; }
.muted-separator { color: #8ca0ab; }

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
.status-ready { color: #0f766e; background: #dff5f1; }
.status-pending { color: #a16207; background: #fff2c7; }

.button { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  gap: .55rem; 
  min-height: 42px; 
  padding: .65rem 1.15rem; 
  border-radius: 10px; 
  font-size: .84rem; 
  font-weight: 750; 
  text-decoration: none; 
  cursor: pointer; 
  white-space: nowrap; 
}
.button-secondary { 
  border: 1px solid #c7dce0; 
  color: #165b72; 
  background: #fff; 
  align-self: flex-start;
}
.button-secondary:hover { border-color: #0f766e; background: #f2fbfa; }

.pending-report-note { 
  display: inline-flex; 
  align-items: center; 
  gap: .45rem; 
  color: #a5c3d4; 
  font-size: .78rem; 
}

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
.empty-inline { padding: 1.25rem 0; color: #728796; font-size: .86rem; text-align: center; }

@media (max-width: 900px) {
  .latest-report-layout { grid-template-columns: 1fr; }
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
