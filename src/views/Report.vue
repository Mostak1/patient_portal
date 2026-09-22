<template>
  <section class="report-page" aria-labelledby="report-title">
    <header class="report-toolbar">
      <RouterLink class="back-link" :to="{ name: 'Dashboard', hash: '#reports' }"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to reports</RouterLink>
      <div class="report-toolbar-actions">
        <a v-if="reportUrl" class="toolbar-button" :href="API_URLS.portalLabReportDownload(route.params.id)" download="lab-report.pdf"><i class="fas fa-download" aria-hidden="true"></i> Download</a>
      </div>
    </header>

    <div class="report-heading"><p class="section-kicker">Laboratory record</p><h1 id="report-title">Your lab report</h1><p>Review the full report below. If something is unclear, contact your care team before making changes to your care plan.</p></div>

    <div v-if="loading" class="report-state" role="status" aria-live="polite"><div class="report-skeleton report-skeleton-large"></div><div class="report-skeleton report-skeleton-line"></div><div class="report-skeleton report-skeleton-line short"></div><p>Loading your secure report</p></div>
    <div v-else-if="reportUrl" class="report-frame"><iframe :src="reportUrl" title="Full laboratory report" @load="onIframeLoad"></iframe></div>
    <div v-else-if="error" class="report-error" role="alert"><i class="fas fa-file-circle-xmark" aria-hidden="true"></i><div><h2>We could not open this report</h2><p>{{ error }}</p><button type="button" class="toolbar-button" @click="loadReport">Try again</button></div></div>
    <div v-else class="report-error"><i class="fas fa-file-circle-xmark" aria-hidden="true"></i><div><h2>This report is not available</h2><p>Please return to your reports list or contact the clinic.</p></div></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URLS } from '../config/api'
import { portalApi } from '../services/portalApi'

const route = useRoute()
const router = useRouter()
const reportUrl = ref('')
const error = ref('')
const loading = ref(true)
const onIframeLoad = () => undefined

const loadReport = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await portalApi.get(API_URLS.portalLabReport(route.params.id), { responseType: 'blob' })
    reportUrl.value = URL.createObjectURL(response.data)
  } catch (requestError) {
    if (requestError.response?.status === 401) {
      await router.replace({ name: 'Login', query: { redirect: route.fullPath, reason: 'expired' } })
    } else {
      error.value = requestError.response?.status === 409 ? 'This report is still being prepared and is not finalized yet.' : requestError.response?.status === 404 ? 'This report is not available.' : 'Please try again in a moment.'
    }
  } finally { loading.value = false }
}

onMounted(loadReport)
onUnmounted(() => { if (reportUrl.value) URL.revokeObjectURL(reportUrl.value) })
</script>

<style scoped>
.report-page { 
  min-height: calc(100dvh - 76px); 
  padding: 1.2rem max(1rem, calc((100% - 1120px) / 2)) 2.5rem; 
  background: #f5f9f9; 
}

.report-toolbar { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1rem; 
  max-width: 1120px; 
  margin: 0 auto; 
}

.back-link, .toolbar-button { 
  display: inline-flex; 
  align-items: center; 
  gap: .45rem; 
  min-height: 40px; 
  padding: .5rem .75rem; 
  border: 1px solid #c7dce0; 
  border-radius: 9px; 
  color: #165b72; 
  background: #fff; 
  font-size: .78rem; 
  font-weight: 750; 
  text-decoration: none; 
  cursor: pointer; 
  transition: border-color .15s ease, background-color .15s ease;
  touch-action: manipulation;
}
.back-link:hover, .toolbar-button:hover { 
  border-color: #0f766e; 
  background: #f2fbfa; 
}

.report-toolbar-actions { 
  display: flex; 
  align-items: center; 
  gap: .8rem; 
}

.report-heading { 
  max-width: 1120px; 
  margin: 1.8rem auto 1.2rem; 
}
.report-heading h1 { 
  margin: .3rem 0 .55rem; 
  color: #163b59; 
  font-size: clamp(1.8rem, 4vw, 2.7rem); 
  letter-spacing: -.045em; 
  font-weight: 800;
}
.report-heading p:not(.section-kicker) { 
  /* max-width: 45rem;  */
  margin: 0; 
  color: #5b7381; 
  line-height: 1.6; 
}
.section-kicker { 
  margin: 0; 
  color: #0f766e; 
  font-size: .7rem; 
  font-weight: 800; 
  letter-spacing: .13em; 
  text-transform: uppercase; 
}

.report-frame { 
  height: calc(100dvh - 255px); 
  min-height: 520px; 
  max-width: 1120px; 
  margin: 0 auto; 
  overflow: hidden; 
  border: 1px solid #d6e3e6; 
  border-radius: 16px; 
  background: #fff; 
  box-shadow: 0 14px 32px rgba(15, 59, 89, .08); 
}
.report-frame iframe { 
  display: block; 
  width: 100%; 
  height: 100%; 
  border: 0; 
}

.report-state, .report-error { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 1rem; 
  min-height: 360px; 
  max-width: 1120px; 
  margin: 0 auto; 
  padding: 2rem; 
  border: 1px solid #d6e3e6; 
  border-radius: 16px; 
  background: #fff; 
  text-align: center; 
}
.report-state { flex-direction: column; }
.report-state p { color: #66808c; font-size: .84rem; }
.report-skeleton { 
  border-radius: 8px; 
  background: linear-gradient(100deg, #e8f0f1 20%, #f7fbfb 40%, #e8f0f1 60%); 
  background-size: 200% 100%; 
  animation: report-shimmer 1.4s ease-in-out infinite; 
}
.report-skeleton-large { width: min(80%, 660px); height: 210px; }
.report-skeleton-line { width: min(55%, 440px); height: 12px; }
.report-skeleton-line.short { width: min(35%, 260px); }

.report-error { color: #66808c; text-align: left; }
.report-error > i { 
  display: grid; 
  place-items: center; 
  width: 44px; 
  height: 44px; 
  border-radius: 12px; 
  color: #0f766e; 
  background: #dff5f1; 
}
.report-error h2 { margin: 0; color: #163b59; font-size: 1.1rem; }
.report-error p { margin: .35rem 0 1rem; font-size: .84rem; }
.report-error .toolbar-button { margin-top: .25rem; }

@keyframes report-shimmer { 
  0% { background-position: 200% 0; } 
  100% { background-position: -200% 0; } 
}
@media (prefers-reduced-motion: reduce) { .report-skeleton { animation: none; } }

@media (max-width: 640px) { 
  .report-page { 
    padding: .6rem .5rem 1rem; 
  }
  .report-toolbar { 
    flex-direction: row; 
    align-items: center; 
    justify-content: space-between; 
    gap: .5rem; 
  }
  .back-link, .toolbar-button { 
    min-height: 36px; 
    padding: .4rem .65rem; 
    font-size: .74rem; 
    border-radius: 8px;
  }
  .report-heading { 
    margin: .6rem 0 .6rem; 
  }
  .report-heading h1 { 
    font-size: 1.35rem; 
    margin: .15rem 0 .25rem; 
  }
  .report-heading p:not(.section-kicker) { 
    font-size: .78rem; 
    line-height: 1.4; 
  }
  .report-frame { 
    height: calc(100dvh - 200px); 
    min-height: 460px; 
    border-radius: 12px; 
  }
  .report-state, .report-error { 
    min-height: 280px; 
    padding: 1.25rem; 
  }
  .report-skeleton-large { width: 100%; }
  .report-skeleton-line, .report-skeleton-line.short { width: 70%; } 
}
</style>
