<template>
  <section class="dashboard-page" aria-labelledby="dashboard-title">
    <!-- Skeleton Loading State -->
    <div v-if="loading" class="dashboard-skeleton" aria-busy="true" aria-label="Loading your health dashboard">
      <div class="skeleton-hero"></div>
      <div class="skeleton-grid">
        <div v-for="item in 4" :key="item" class="skeleton-block"></div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-block skeleton-tall"></div>
        <div class="skeleton-block skeleton-tall"></div>
      </div>
    </div>

    <div v-else>
      <!-- Error Alert -->
      <div v-if="error" class="dashboard-error" role="alert">
        <div>
          <strong>We could not load your dashboard.</strong>
          <p>{{ error }}</p>
        </div>
        <button type="button" class="button button-secondary" @click="loadDashboard">Try again</button>
      </div>

      <!-- 1. Hero Header -->
      <DashboardHero
        :patient-name="patientName"
        :patient-id="patient?.contact_id"
      />

      <!-- 2. Urgent Alert (if active) -->
      <DashboardUrgentAlert :urgent-alert="urgentAlert" />

      <!-- Jump Navigation -->
      <nav class="dashboard-jump-nav" aria-label="Dashboard sections">
        <a href="#overview">Overview</a>
        <a href="#appointments">Appointments</a>
        <a href="#reports">Reports</a>
        <a href="#prescriptions">Prescriptions</a>
        <a href="#lifestyle">Lifestyle</a>
      </nav>

      <!-- 3. Care Timeline -->
      <DashboardTimeline
        :latest-report="latestReport"
        :latest-visit-date="data.latest_visit?.transaction_date"
        :report-progress="reportProgress"
      />

      <!-- 3.5. My Appointments Section -->
      <MyAppointments />

      <!-- 4. Latest Report Summary -->
      <DashboardLatestReport
        :latest-report="latestReport"
        :latest-results="latestResults"
      />

      <!-- 5. Recorded Trends (hidden on mobile) -->
      <!-- <DashboardTrends :trends="trends" /> -->

      <!-- 6. Records: Lab Reports & Prescriptions -->
      <DashboardRecords
        :reports="reports"
        :prescriptions="prescriptions"
      />

      <!-- 7. Lifestyle Calculation & Care Team Notes -->
      <DashboardLifestyle
        :lifestyle-items="lifestyleItems"
        :guidance="guidance"
      />

      <!-- 8. Care Team Updates & Clinical Notes -->
      <DashboardNotes :non-urgent-alerts="nonUrgentAlerts" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_URLS } from '../config/api'
import { authState, portalApi } from '../services/portalApi'
import DashboardHero from '../components/dashboard/DashboardHero.vue'
import DashboardUrgentAlert from '../components/dashboard/DashboardUrgentAlert.vue'
import DashboardTimeline from '../components/dashboard/DashboardTimeline.vue'
import DashboardLatestReport from '../components/dashboard/DashboardLatestReport.vue'
import DashboardTrends from '../components/dashboard/DashboardTrends.vue'
import DashboardRecords from '../components/dashboard/DashboardRecords.vue'
import DashboardLifestyle from '../components/dashboard/DashboardLifestyle.vue'
import DashboardNotes from '../components/dashboard/DashboardNotes.vue'
import MyAppointments from '../components/dashboard/MyAppointments.vue'

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

const guidance = computed(() => {
  if (data.value.nutrition_guidance?.length) return data.value.nutrition_guidance
  const items = []
  for (const item of data.value.nutrition_foods || []) {
    if (item.product_name || item.instructions) {
      items.push({
        type: 'Food',
        text: [item.product_name, item.instructions].filter(Boolean).join(' · '),
        date: item.prescription_date
      })
    }
  }
  for (const item of data.value.nutrition_lifestyles || []) {
    if (item.product_name || item.instructions) {
      items.push({
        type: 'Lifestyle',
        text: [item.product_name, item.instructions].filter(Boolean).join(' · '),
        date: item.prescription_date
      })
    }
  }
  return items
})

const lifestyleItems = computed(() => {
  if (data.value.lifestyle_summary?.length) return data.value.lifestyle_summary
  return (data.value.metrics || []).map(metric => ({
    key: metric.key,
    label: metric.label,
    value: metric.value,
    unit: metric.unit,
    note: metric.status === 'educational' ? 'Educational calculation' : 'Recorded at intake'
  }))
})

const loadDashboard = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await portalApi.get(API_URLS.portalDashboard)
    data.value = response.data.data || {}
  } catch (requestError) {
    error.value = requestError.response?.status === 401
      ? 'Your session has expired. Please sign in again.'
      : 'Please try again in a moment.'
    if (requestError.response?.status === 401) {
      await router.replace({ name: 'Login', query: { redirect: '/dashboard', reason: 'expired' } })
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page { 
  display: grid; 
  gap: 2.2rem; 
  min-width: 0; 
  padding-bottom: 2rem; 
}

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
}
.button-secondary:hover { border-color: #0f766e; background: #f2fbfa; }

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

@keyframes dashboard-shimmer { 
  0% { background-position: 200% 0; } 
  100% { background-position: -200% 0; } 
}

@media (prefers-reduced-motion: reduce) { 
  .skeleton-hero, .skeleton-block { animation: none; } 
  .button { transition: none; } 
}

@media (max-width: 900px) { 
  .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .dashboard-jump-nav {
    display: none;
  }
}

@media (max-width: 640px) { 
  .dashboard-page { gap: 1.35rem; }
  .dashboard-error { 
    align-items: flex-start; 
    flex-direction: column; 
  }
  .dashboard-error .button { width: 100%; }
  .skeleton-content { grid-template-columns: 1fr; }
}
</style>
