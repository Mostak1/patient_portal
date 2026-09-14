<template>
  <section class="dashboard-page" aria-labelledby="dashboard-title">
    <div v-if="loading" class="dashboard-skeleton" aria-busy="true" aria-label="Loading your health dashboard">
      <div class="skeleton-hero"></div>
      <div class="skeleton-grid"><div v-for="item in 4" :key="item" class="skeleton-block"></div></div>
      <div class="skeleton-content"><div class="skeleton-block skeleton-tall"></div><div class="skeleton-block skeleton-tall"></div></div>
    </div>

    <div v-else>
      <div v-if="error" class="dashboard-error" role="alert">
        <div><strong>We could not load your dashboard.</strong><p>{{ error }}</p></div>
        <button type="button" class="button button-secondary" @click="loadDashboard">Try again</button>
      </div>

      <header class="dashboard-hero">
        <div class="hero-copy">
          <p class="section-kicker">Patient portal</p>
          <h1 id="dashboard-title">Good to see you, {{ patientName }}</h1>
        </div>
        <div class="patient-summary"><span>Patient ID</span><strong>{{ patient?.contact_id || 'Not recorded' }}</strong>
          <!-- <small>Updated {{ formatDateTime(data.last_updated) }}</small> -->
        </div>
      </header>

      <section v-if="urgentAlert" class="urgent-alert" aria-labelledby="urgent-alert-title" role="alert">
        <div class="alert-mark" aria-hidden="true"><i class="fas fa-exclamation"></i></div>
        <div class="alert-copy"><p class="section-kicker">Urgent care alert</p><h2 id="urgent-alert-title">{{ urgentAlert.title }}</h2><p>{{ urgentAlert.reason }}</p><small>{{ urgentAlert.action_type === 'seek_emergency_care' ? 'If you have severe or rapidly worsening symptoms, seek emergency care now.' : 'Please contact the clinic for guidance.' }}</small></div>
        <a v-if="urgentAlert.action_type === 'seek_emergency_care'" class="button button-danger" href="tel:999">Seek emergency help</a>
        <a v-else class="button button-danger" href="tel:+8809666747470">Contact the clinic</a>
      </section>

      <!-- <div class="dashboard-priority-grid">
        <article class="next-step-panel dashboard-panel">
          <div class="panel-heading"><div><p class="section-kicker">Your next step</p><h2>{{ nextAction.title }}</h2></div><span class="step-number" aria-hidden="true">01</span></div>
          <p>{{ nextAction.description }}</p>
          <a v-if="nextAction.type === 'contact_clinic'" class="button button-primary" href="tel:+8809666747470">Contact the clinic <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
          <RouterLink v-else-if="nextAction.type === 'review_report' && latestReport" class="button button-primary" :to="{ name: 'Report', params: { id: latestReport.transaction_id } }">Review latest report <i class="fas fa-arrow-right" aria-hidden="true"></i></RouterLink>
          <a v-else-if="nextAction.type === 'follow_guidance'" class="button button-primary" href="#lifestyle">View guidance <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
          <span v-else class="quiet-confirmation"><i class="fas fa-check-circle" aria-hidden="true"></i> You are up to date</span>
        </article>

        <article class="care-status-panel dashboard-panel" :class="`care-status-${careStatus.level}`" aria-labelledby="care-status-title">
          <div class="panel-heading"><div><p class="section-kicker">Current care status</p><h2 id="care-status-title">{{ careStatus.label }}</h2></div><span class="status-icon" aria-hidden="true"><i :class="careStatus.icon"></i></span></div>
          <p>{{ careStatus.description }}</p>
          <div class="status-legend" aria-label="Status meaning"><span><i class="status-dot status-dot-stable"></i> Stable</span><span><i class="status-dot status-dot-follow-up"></i> Follow-up</span><span><i class="status-dot status-dot-urgent"></i> Urgent</span></div>
        </article>
      </div> -->

      <nav class="dashboard-jump-nav" aria-label="Dashboard sections"><a href="#overview">Overview</a><a href="#reports">Reports</a><a href="#prescriptions">Prescriptions</a><a href="#lifestyle">Lifestyle</a></nav>

      <section id="overview" class="dashboard-section" aria-labelledby="overview-title">
        <div class="section-heading-row"><div><p class="section-kicker">Latest activity</p><h2 id="overview-title">Your care timeline</h2></div><span class="section-meta">{{ formatDate(data.latest_visit?.transaction_date) }}</span></div>
        <div class="timeline-panel dashboard-panel">
          <div v-if="!latestReport" class="empty-state"><span class="empty-icon" aria-hidden="true"><i class="fas fa-clipboard-list"></i></span><div><h3>No report timeline yet</h3><p>When a report is linked to your profile, its progress will appear here.</p></div></div>
          <ol v-else class="care-timeline"><li v-for="step in reportProgress" :key="step.key" :class="`timeline-${step.state}`"><span class="timeline-marker" aria-hidden="true"><i :class="stepIcon(step.state)"></i></span><div><strong>{{ step.label }}</strong><span>{{ step.detail }}</span></div></li></ol>
        </div>
      </section>

      <section class="dashboard-section report-section" aria-labelledby="latest-report-title">
        <div class="section-heading-row"><div><p class="section-kicker">Understand your results</p><h2 id="latest-report-title">Latest report summary</h2></div><RouterLink v-if="latestReport && isReportReady(latestReport)" class="text-link" :to="{ name: 'Report', params: { id: latestReport.transaction_id } }">View full report <i class="fas fa-arrow-right" aria-hidden="true"></i></RouterLink><span v-else-if="latestReport" class="section-meta">Report still being prepared</span></div>
        <div v-if="!latestReport" class="dashboard-panel empty-state"><span class="empty-icon" aria-hidden="true"><i class="fas fa-file-medical"></i></span><div><h3>Your latest report will appear here</h3><p>There are no completed lab reports linked to this profile yet.</p></div></div>
        <div v-else class="latest-report-layout">
          <article class="latest-report-card dashboard-panel"><div class="report-card-topline"><span class="report-type"><i class="fas fa-vial" aria-hidden="true"></i> Laboratory report</span><span class="status-badge" :class="`status-${reportStatus(latestReport)}`">{{ reportStatusLabel(latestReport) }}</span></div><h3>{{ latestReport.invoice_no || `Report ${latestReport.id}` }}</h3><p>{{ formatDate(latestReport.transaction_date) }} <span class="muted-separator">·</span> {{ latestReport.status || 'Report recorded' }}</p><RouterLink v-if="isReportReady(latestReport)" class="button button-secondary" :to="{ name: 'Report', params: { id: latestReport.transaction_id } }">Open full report</RouterLink><span v-else class="pending-report-note"><i class="fas fa-hourglass-half" aria-hidden="true"></i> The care team is preparing this report.</span></article>
          <div class="result-summary-list dashboard-panel"><div class="panel-heading compact-heading"><h3>Key results</h3><span class="section-meta">Based on recorded report values</span></div><div v-if="!latestResults.length" class="empty-inline">No result summary is available for this report.</div><div v-for="result in latestResults" :key="`${result.name}-${result.result}`" class="result-summary-row"><div><strong>{{ result.name }}</strong><span v-if="result.reference_value">Reference: {{ result.reference_value }}</span></div><div class="result-value"><strong>{{ result.result || 'Recorded' }} <small>{{ result.unit }}</small></strong><span class="status-text" :class="`status-text-${result.status}`">{{ resultStatusLabel(result.status) }}</span></div></div></div>
        </div>
      </section>

      <section v-if="trends.length" class="dashboard-section" aria-labelledby="trends-title">
        <div class="section-heading-row"><div><p class="section-kicker">Over time</p><h2 id="trends-title">Recorded trends</h2></div><span class="section-meta">At least two dated results</span></div>
        <div class="trend-grid"><article v-for="trend in trends" :key="trend.key" class="trend-card dashboard-panel"><div class="trend-heading"><h3>{{ trend.label }}</h3><span>{{ trend.unit }}</span></div><div class="trend-values" aria-hidden="true"><span v-for="point in trend.points" :key="`${trend.key}-${point.date}`" :style="{ height: `${trendBarHeight(trend, point.value)}%` }"></span></div><div class="trend-footer"><strong>{{ trend.points[trend.points.length - 1].value }}</strong><span>Latest recorded value</span></div></article></div>
      </section>

      <div class="dashboard-two-column">
        <section id="reports" class="dashboard-section" aria-labelledby="reports-title"><div class="section-heading-row"><div><p class="section-kicker">Records</p><h2 id="reports-title">Lab reports</h2></div><span class="section-meta">{{ reports.length }} total</span></div><div class="dashboard-panel record-panel"><div v-if="!reports.length" class="empty-inline">No laboratory reports are available yet.</div><div v-for="report in reports.slice(0, 5)" :key="report.id" class="record-row"><div class="record-icon" aria-hidden="true"><i class="fas fa-file-medical"></i></div><div class="record-main"><strong>{{ report.invoice_no || `Report ${report.id}` }}</strong><span>{{ formatDate(report.transaction_date) }}</span></div><span class="status-badge" :class="`status-${reportStatus(report)}`">{{ reportStatusLabel(report) }}</span><RouterLink v-if="isReportCompleted(report.status)" class="icon-link" :to="{ name: 'Report', params: { id: report.transaction_id } }" :aria-label="`View ${report.invoice_no || 'lab report'}`"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></RouterLink></div></div></section>
        <section id="prescriptions" class="dashboard-section" aria-labelledby="prescriptions-title"><div class="section-heading-row"><div><p class="section-kicker">Treatment plan</p><h2 id="prescriptions-title">Prescriptions</h2></div><span class="section-meta">{{ prescriptions.length }} total</span></div><div class="dashboard-panel record-panel"><div v-if="!prescriptions.length" class="empty-inline">No prescriptions are available yet.</div><div v-for="prescription in prescriptions.slice(0, 5)" :key="prescription.id" class="record-row"><div class="record-icon record-icon-teal" aria-hidden="true"><i class="fas fa-prescription-bottle-medical"></i></div><div class="record-main"><strong>{{ prescription.prescription_number || `Prescription ${prescription.id}` }}</strong><span>{{ formatDate(prescription.visit_date || prescription.prescription_date) }}</span></div><span class="status-badge status-recorded">{{ prescription.status || 'Recorded' }}</span><RouterLink class="icon-link" :to="{ name: 'Prescription', params: { id: prescription.id } }" :aria-label="`View ${prescription.prescription_number || 'prescription'}`"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></RouterLink></div></div></section>
      </div>

      <div class="dashboard-two-column">
        <section id="lifestyle" class="dashboard-section" aria-labelledby="lifestyle-title"><div class="section-heading-row"><div><p class="section-kicker">Daily health</p><h2 id="lifestyle-title">Lifestyle calculation</h2></div><span class="educational-label">Educational summary</span></div><div class="dashboard-panel lifestyle-panel"><div v-if="!lifestyleItems.length" class="empty-inline">No lifestyle measurements are recorded yet.</div><div v-for="metric in lifestyleItems" :key="metric.key" class="lifestyle-row"><div><strong>{{ metric.label }}</strong><span>{{ metric.note }}</span></div><strong class="lifestyle-value">{{ metric.value }} <small>{{ metric.unit }}</small></strong></div><p class="disclaimer">These values are educational summaries of recorded information. They are not a diagnosis.</p></div></section>
        <section class="dashboard-section" aria-labelledby="guidance-title"><div class="section-heading-row"><div><p class="section-kicker">Care team notes</p><h2 id="guidance-title">Food and lifestyle guidance</h2></div><span class="educational-label">Clinician recorded</span></div><div class="dashboard-panel guidance-panel"><div v-if="!guidance.length" class="empty-inline">No food or lifestyle guidance is recorded yet.</div><div v-for="(item, index) in guidance.slice(0, 6)" :key="`${item.text}-${index}`" class="guidance-row"><span class="guidance-marker" aria-hidden="true"><i :class="item.type === 'Food' ? 'fas fa-leaf' : 'fas fa-person-walking'"></i></span><div><strong>{{ item.type }}</strong><p>{{ item.text }}</p><small v-if="item.date">Recorded {{ formatDate(item.date) }}</small></div></div><p class="disclaimer">Follow the plan provided by your care team and contact the clinic if you have questions.</p></div></section>
      </div>

      <section v-if="nonUrgentAlerts.length" class="dashboard-section" aria-labelledby="notes-title"><div class="section-heading-row"><div><p class="section-kicker">Clinical notes</p><h2 id="notes-title">Care team updates</h2></div><span class="section-meta">{{ nonUrgentAlerts.length }} update{{ nonUrgentAlerts.length === 1 ? '' : 's' }}</span></div><div class="notes-list"><article v-for="alert in nonUrgentAlerts" :key="alert.id || `${alert.created_at}-${alert.reason}`" class="note-card dashboard-panel"><span class="status-badge" :class="`status-${alert.level}`">{{ alertLevelLabel(alert.level) }}</span><div><h3>{{ alert.title }}</h3><p>{{ alert.reason }}</p><small>{{ formatDate(alert.created_at) }} · {{ alert.source }}</small></div></article></div></section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_URLS } from '../config/api'
import { authState, portalApi } from '../services/portalApi'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const data = ref({ patient: authState.patient, metrics: [], insights: [], alerts: [] })
const patient = computed(() => data.value.patient || authState.patient)
const patientName = computed(() => patient.value?.first_name || patient.value?.name || 'there')
const reports = computed(() => data.value.lab_reports || [])
const prescriptions = computed(() => data.value.prescriptions || [])
const latestReport = computed(() => data.value.latest_report || reports.value[0] || null)
const latestResults = computed(() => data.value.latest_results || [])
const trends = computed(() => data.value.trends || [])
const alerts = computed(() => data.value.alerts || data.value.insights || [])
const urgentAlert = computed(() => alerts.value.find(item => item.level === 'urgent') || null)
const nonUrgentAlerts = computed(() => alerts.value.filter(item => item.level !== 'urgent'))
const fallbackProgress = computed(() => [
  { key: 'ordered', label: 'Test ordered', state: 'complete', detail: 'Your visit has been recorded.' },
  { key: 'report_ready', label: 'Report ready', state: latestReport.value ? 'current' : 'not-recorded', detail: latestReport.value ? 'Your report is available to view.' : 'Waiting for a finalized report.' },
  { key: 'clinician_review', label: 'Clinician review', state: 'not-recorded', detail: 'Review notes will appear here when available.' },
])
const reportProgress = computed(() => {
  const rawSteps = data.value.report_progress?.steps || fallbackProgress.value
  return rawSteps.filter(step => step.key !== 'sample_received' && step.label?.toLowerCase() !== 'sample received')
})
const careStatus = computed(() => data.value.care_status || {
  level: urgentAlert.value ? 'urgent' : latestResults.value.some(item => item.status === 'attention') ? 'follow-up' : 'stable',
  label: urgentAlert.value ? 'Urgent medical attention' : latestResults.value.some(item => item.status === 'attention') ? 'Follow-up recommended' : 'Stable',
  description: urgentAlert.value ? 'An explicit clinical alert needs your attention.' : latestResults.value.some(item => item.status === 'attention') ? 'Some recorded results should be discussed with your care team.' : 'No urgent clinical alert is recorded in your latest portal data.',
  icon: urgentAlert.value ? 'fas fa-triangle-exclamation' : 'fas fa-heart-pulse',
})
const guidance = computed(() => {
  if (data.value.nutrition_guidance?.length) return data.value.nutrition_guidance
  const items = []
  for (const item of data.value.nutrition_foods || []) if (item.product_name || item.instructions) items.push({ type: 'Food', text: [item.product_name, item.instructions].filter(Boolean).join(' · '), date: item.prescription_date })
  for (const item of data.value.nutrition_lifestyles || []) if (item.product_name || item.instructions) items.push({ type: 'Lifestyle', text: [item.product_name, item.instructions].filter(Boolean).join(' · '), date: item.prescription_date })
  return items
})
const nextAction = computed(() => {
  if (urgentAlert.value) return { type: 'contact_clinic', title: 'Contact your care team', description: urgentAlert.value.action_type === 'seek_emergency_care' ? 'Your care team has marked this as urgent. Follow the emergency guidance above.' : 'A clinician has asked you to contact the clinic about your care.' }
  if (data.value.next_action) return data.value.next_action
  if (latestReport.value && isReportReady(latestReport.value)) return { type: 'review_report', title: 'Review your latest report', description: 'Your latest report is ready to view. Open it to see the recorded details.' }
  if (guidance.value.length) return { type: 'follow_guidance', title: 'Follow your care plan', description: 'Your care team has recorded food or lifestyle guidance for you.' }
  return { type: 'none', title: 'No action needed today', description: 'Your portal does not show a new action from the care team.' }
})
const lifestyleItems = computed(() => data.value.lifestyle_summary?.length ? data.value.lifestyle_summary : (data.value.metrics || []).map(metric => ({ key: metric.key, label: metric.label, value: metric.value, unit: metric.unit, note: metric.status === 'educational' ? 'Educational calculation' : 'Recorded at intake' })))
const formatDate = value => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded'
const formatDateTime = value => value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'not available'
const isReportCompleted = status => ['completed', 'finalized', 'finalised', 'ready'].includes(String(status ?? '').trim().toLowerCase())
const isReportReady = report => isReportCompleted(report?.status) || Boolean(report?.finalized_at)
const reportStatus = report => isReportReady(report) ? 'ready' : 'pending'
const reportStatusLabel = report => reportStatus(report) === 'ready' ? 'Ready to view' : 'In progress'
const resultStatusLabel = status => ({ normal: 'Within recorded range', attention: 'Review with care team', urgent: 'Urgent review', recorded: 'Recorded' }[status] || 'Recorded')
const alertLevelLabel = level => ({ informational: 'Information', 'follow-up': 'Follow-up', attention: 'Follow-up' }[level] || 'Care note')
const stepIcon = state => ({ complete: 'fas fa-check', current: 'fas fa-circle', 'not-recorded': 'fas fa-minus' }[state] || 'fas fa-minus')
const trendBarHeight = (trend, value) => { const values = trend.points.map(point => Number(point.value)).filter(Number.isFinite); const min = Math.min(...values); const max = Math.max(...values); if (max === min) return 52; return Math.max(18, Math.round(((Number(value) - min) / (max - min)) * 70) + 22) }
const loadDashboard = async () => { loading.value = true; error.value = ''; try { const response = await portalApi.get(API_URLS.portalDashboard); data.value = response.data.data || {} } catch (requestError) { error.value = requestError.response?.status === 401 ? 'Your session has expired. Please sign in again.' : 'Please try again in a moment.'; if (requestError.response?.status === 401) await router.replace({ name: 'Login', query: { redirect: '/dashboard', reason: 'expired' } }) } finally { loading.value = false } }
onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page { 
  display: grid; 
  gap: 2.2rem; 
  min-width: 0; 
  padding-bottom: 2rem; 
}

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
.hero-copy p:not(.section-kicker) { 
  max-width: 36rem; 
  margin: 0; 
  color: #c9d8e5; 
  line-height: 1.65; 
  font-size: 0.96rem;
}

.section-kicker { 
  margin: 0; 
  color: #0f766e; 
  font-size: .72rem; 
  font-weight: 800; 
  letter-spacing: .13em; 
  text-transform: uppercase; 
}
.dashboard-hero .section-kicker { color: #8be4d6; }

.patient-summary { 
  display: grid; 
  gap: .25rem; 
  min-width: 160px; 
  padding-left: 1.2rem; 
  border-left: 1px solid rgba(203, 213, 225, .28); 
}
.patient-summary span, .patient-summary small { 
  color: #b9cedd; 
  font-size: .75rem; 
}
.patient-summary strong { 
  color: #fff; 
  font-size: 1.1rem; 
  letter-spacing: .02em; 
}

.dashboard-priority-grid, .dashboard-two-column { 
  display: grid; 
  grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); 
  gap: 1.25rem; 
  margin-top: 1.25rem;
}

.dashboard-panel { 
  min-width: 0; 
  padding: 1.35rem; 
  border: 1px solid #dce6e8; 
  border-radius: 20px; 
  background: rgba(255, 255, 255, .94); 
  box-shadow: 0 10px 28px rgba(15, 59, 89, .05); 
}

.panel-heading, .section-heading-row, .report-card-topline, .trend-heading, .trend-footer { 
  display: flex; 
  align-items: flex-start; 
  justify-content: space-between; 
  gap: 1rem; 
}

.panel-heading h2, .section-heading-row h2 { 
  margin: .25rem 0 0; 
  color: #163b59; 
  font-size: 1.35rem; 
  letter-spacing: -.025em; 
  font-weight: 800;
}

.dashboard-panel p { 
  color: #50677a; 
  line-height: 1.6; 
}

.step-number { 
  color: #8aa8b5; 
  font-size: .8rem; 
  font-weight: 800; 
  letter-spacing: .08em; 
}

.next-step-panel { 
  background: #f4fbfa; 
  border-color: #c8ebe5; 
}
.next-step-panel > p { 
  max-width: 34rem; 
  margin: 1.1rem 0 1.25rem; 
}

.quiet-confirmation { 
  display: inline-flex; 
  align-items: center; 
  gap: .5rem; 
  min-height: 44px; 
  color: #0f766e; 
  font-size: .9rem; 
  font-weight: 700; 
}
.quiet-confirmation i { font-size: 1.1rem; }

.care-status-panel { background: #f8fbfc; }
.care-status-follow-up { border-color: #ead8a3; background: #fffcf2; }
.care-status-urgent { border-color: #fecaca; background: #fff7f7; }

.status-icon { 
  display: grid; 
  place-items: center; 
  width: 42px; 
  height: 42px; 
  border-radius: 12px; 
  color: #0f766e; 
  background: #d8f3ee; 
}
.care-status-follow-up .status-icon { color: #a16207; background: #fef3c7; }
.care-status-urgent .status-icon { color: #b91c1c; background: #fee2e2; }

.status-legend { 
  display: flex; 
  flex-wrap: wrap; 
  gap: .9rem; 
  margin-top: 1.2rem; 
  color: #5d7280; 
  font-size: .74rem; 
}
.status-legend span { display: inline-flex; align-items: center; gap: .35rem; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.status-dot-stable { background: #0f766e; }
.status-dot-follow-up { background: #d97706; }
.status-dot-urgent { background: #dc2626; }

.urgent-alert { 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  align-items: center; 
  gap: 1rem; 
  padding: 1.15rem 1.3rem; 
  border: 1px solid #fecaca; 
  border-left: 5px solid #dc2626; 
  border-radius: 16px; 
  background: #fff7f7; 
  box-shadow: 0 10px 24px rgba(185, 28, 28, .06); 
}
.alert-mark { 
  display: grid; 
  place-items: center; 
  width: 42px; 
  height: 42px; 
  border-radius: 12px; 
  color: #fff; 
  background: #dc2626; 
}
.alert-copy h2 { margin: .25rem 0 .25rem; color: #991b1b; font-size: 1.1rem; }
.alert-copy p:not(.section-kicker) { margin: 0; color: #7f1d1d; }
.alert-copy small { display: block; margin-top: .35rem; color: #991b1b; }

.button { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  gap: .55rem; 
  min-height: 44px; 
  padding: .65rem 1rem; 
  border: 1px solid transparent; 
  border-radius: 11px; 
  font-size: .86rem; 
  font-weight: 750; 
  text-decoration: none; 
  cursor: pointer; 
  transition: transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease; 
  touch-action: manipulation;
}
.button:hover { transform: translateY(-1px); }
.button:active { transform: translateY(1px) scale(.98); }
.button:focus-visible, .text-link:focus-visible, .icon-link:focus-visible, .dashboard-jump-nav a:focus-visible { 
  outline: 3px solid rgba(20, 184, 166, .38); 
  outline-offset: 3px; 
}
.button-primary { 
  color: #fff; 
  background: #0f766e; 
  box-shadow: 0 6px 16px rgba(15, 118, 110, .2); 
}
.button-primary:hover { background: #115e59; }
.button-secondary { 
  color: #164e63; 
  border-color: #bdd6db; 
  background: #fff; 
}
.button-secondary:hover { border-color: #0f766e; background: #f2fbfa; }
.button-danger { color: #fff; background: #b91c1c; }
.button-danger:hover { background: #991b1b; }

.dashboard-jump-nav { 
  display: flex; 
  gap: .4rem; 
  padding: .25rem; 
  border-bottom: 1px solid #dce6e8; 
  overflow-x: auto; 
}
.dashboard-jump-nav a { 
  padding: .55rem .8rem; 
  border-radius: 8px; 
  color: #587080; 
  font-size: .82rem; 
  font-weight: 700; 
  text-decoration: none; 
  white-space: nowrap; 
}
.dashboard-jump-nav a:hover { color: #0f766e; background: #eef8f6; }

.dashboard-section { 
  display: grid; 
  gap: 1rem; 
  min-width: 0; 
  scroll-margin-top: 85px; 
  margin-top: 1.25rem;
}

#overview, #reports, #prescriptions, #lifestyle {
  scroll-margin-top: 85px;
}
.section-heading-row { align-items: end; }
.section-meta { color: #718695; font-size: .78rem; font-weight: 600; }
.text-link { color: #0f766e; font-size: .82rem; font-weight: 750; text-decoration: none; }
.text-link:hover { color: #115e59; }

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
.latest-report-card .button { align-self: flex-start; }
.report-type { color: #a7e6dc; font-size: .74rem; font-weight: 700; }

.result-summary-list { padding: 1.1rem 1.25rem; }
.compact-heading { align-items: end; margin-bottom: .6rem; }
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

.status-badge, .educational-label { 
  display: inline-flex; 
  align-items: center; 
  width: fit-content; 
  padding: .32rem .55rem; 
  border-radius: 7px; 
  font-size: .68rem; 
  font-weight: 750; 
  line-height: 1; 
}
.status-ready, .status-normal, .status-stable, .status-recorded { color: #0f766e; background: #dff5f1; }
.status-pending, .status-follow-up, .status-attention { color: #a16207; background: #fff2c7; }
.status-urgent { color: #b91c1c; background: #fee2e2; }
.educational-label { color: #356579; background: #e7f0f2; }

.trend-grid { 
  display: grid; 
  grid-template-columns: repeat(3, minmax(0, 1fr)); 
  gap: 1rem; 
}
.trend-card { display: grid; gap: .8rem; }
.trend-heading h3 { margin: 0; color: #294e62; font-size: .95rem; }
.trend-heading span { color: #7b8d98; font-size: .72rem; }
.trend-values { 
  display: flex; 
  align-items: end; 
  gap: .35rem; 
  height: 84px; 
  padding: .65rem .2rem 0; 
  border-bottom: 1px solid #dce6e8; 
}
.trend-values span { 
  flex: 1; 
  min-height: 12px; 
  border-radius: 4px 4px 0 0; 
  background: linear-gradient(180deg, #42b7a8, #0f766e); 
}
.trend-footer { align-items: baseline; }
.trend-footer strong { color: #163b59; font-size: 1.2rem; font-variant-numeric: tabular-nums; }
.trend-footer span { color: #7b8d98; font-size: .7rem; }

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
.icon-link:hover { color: #115e59; background: #eef8f6; }

.lifestyle-panel, .guidance-panel { display: grid; gap: .8rem; }
.lifestyle-row { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  padding: .85rem 0; 
  border-bottom: 1px solid #e6eef0; 
}
.lifestyle-row strong, .lifestyle-row span { display: block; }
.lifestyle-row > div strong { color: #294e62; font-size: .86rem; }
.lifestyle-row > div span { margin-top: .22rem; color: #84949d; font-size: .72rem; }
.lifestyle-value { color: #0f766e; font-size: 1.1rem; font-variant-numeric: tabular-nums; }
.lifestyle-value small { color: #718695; font-size: .7rem; }

.guidance-row { 
  display: grid; 
  grid-template-columns: auto 1fr; 
  gap: .75rem; 
  padding: .3rem 0 .7rem; 
}
.guidance-marker { 
  display: grid; 
  place-items: center; 
  width: 30px; 
  height: 30px; 
  border-radius: 8px; 
  color: #0f766e; 
  background: #dff5f1; 
  font-size: .75rem; 
}
.guidance-row strong { color: #294e62; font-size: .76rem; }
.guidance-row p { margin: .2rem 0; color: #4d6876; font-size: .84rem; }
.guidance-row small { color: #8a9aa3; font-size: .7rem; }
.disclaimer { margin: .25rem 0 0; color: #718695 !important; font-size: .72rem; }

.pending-report-note { 
  display: inline-flex; 
  align-items: center; 
  gap: .45rem; 
  align-self: flex-start; 
  min-height: 44px; 
  color: #b8d3dc; 
  font-size: .78rem; 
  font-weight: 700; 
}

.notes-list { display: grid; gap: .75rem; }
.note-card { 
  display: grid; 
  grid-template-columns: auto 1fr; 
  align-items: start; 
  gap: 1rem; 
}
.note-card h3 { margin: 0; color: #294e62; font-size: .92rem; }
.note-card p { margin: .3rem 0; font-size: .84rem; }
.note-card small { color: #8a9aa3; font-size: .72rem; }

.empty-state { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  min-height: 110px; 
}
.empty-state h3 { margin: 0; color: #294e62; font-size: .95rem; }
.empty-state p { margin: .3rem 0 0; font-size: .84rem; }
.empty-icon { 
  display: grid; 
  place-items: center; 
  flex: 0 0 42px; 
  width: 42px; 
  height: 42px; 
  border-radius: 12px; 
  color: #0f766e; 
  background: #dff5f1; 
}
.empty-inline { padding: 1.1rem .2rem; color: #718695; font-size: .84rem; }

.dashboard-error { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  padding: 1rem 1.15rem; 
  border: 1px solid #f4c6c6; 
  border-radius: 14px; 
  color: #7f1d1d; 
  background: #fff7f7; 
}
.dashboard-error strong { font-size: .9rem; }
.dashboard-error p { margin: .25rem 0 0; color: #991b1b; font-size: .8rem; }

.dashboard-skeleton { display: grid; gap: 1.5rem; }
.skeleton-hero, .skeleton-block { 
  border-radius: 18px; 
  background: linear-gradient(100deg, #e8f0f1 20%, #f7fbfb 40%, #e8f0f1 60%); 
  background-size: 200% 100%; 
  animation: dashboard-shimmer 1.4s ease-in-out infinite; 
}
.skeleton-hero { height: 230px; border-radius: 24px; }
.skeleton-grid, .skeleton-content { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 1rem; 
}
.skeleton-content { grid-template-columns: repeat(2, 1fr); }
.skeleton-block { height: 106px; }
.skeleton-tall { height: 260px; }

@keyframes dashboard-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (prefers-reduced-motion: reduce) { 
  .skeleton-hero, .skeleton-block { animation: none; } 
  .button { transition: none; } 
}

/* Tablet Layout */
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
  .dashboard-priority-grid, .dashboard-two-column, .latest-report-layout { 
    grid-template-columns: 1fr; 
  }
  .trend-grid { grid-template-columns: repeat(2, 1fr); }
  .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile Screens (<= 768px) */
@media (max-width: 768px) {
  .dashboard-jump-nav {
    display: none;
  }
}

/* Small Mobile Screens (<= 640px) */
@media (max-width: 640px) { 
  .dashboard-page { gap: 1.35rem; }
  .dashboard-hero { 
    padding: 1.35rem 1.15rem; 
    border-radius: 18px;
  }
  .hero-copy h1 { 
    font-size: 1.65rem; 
    line-height: 1.15;
  }
  .hero-copy p:not(.section-kicker) {
    font-size: 0.88rem;
    line-height: 1.5;
  }
  .urgent-alert { 
    grid-template-columns: auto 1fr; 
  }
  .urgent-alert .button { 
    grid-column: 1 / -1; 
    width: 100%; 
  }
  .dashboard-panel { 
    padding: 1.15rem 1rem; 
    border-radius: 16px;
  }
  .section-heading-row { 
    align-items: flex-start; 
    flex-direction: column; 
    gap: .35rem; 
  }
  .section-heading-row h2 {
    font-size: 1.22rem;
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
  .trend-grid { grid-template-columns: 1fr; }
  
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

  .dashboard-error { 
    align-items: flex-start; 
    flex-direction: column; 
  }
  .dashboard-error .button { width: 100%; }
  .skeleton-content { grid-template-columns: 1fr; }
}

@media (max-width: 380px) {
  .hero-copy h1 { font-size: 1.45rem; }
  .dashboard-panel { padding: 1rem 0.85rem; }
}
</style>
