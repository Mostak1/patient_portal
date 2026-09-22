<template>
  <section v-if="trends.length" class="dashboard-section trends-section" aria-labelledby="trends-title">
    <div class="section-heading-row">
      <div>
        <p class="section-kicker">Over time</p>
        <h2 id="trends-title">Recorded trends</h2>
      </div>
      <span class="section-meta">At least two dated results</span>
    </div>
    <div class="trend-grid">
      <article v-for="trend in trends" :key="trend.key" class="trend-card dashboard-panel">
        <div class="trend-heading">
          <h3>{{ trend.label }}</h3>
          <span>{{ trend.unit }}</span>
        </div>
        <div class="trend-values" aria-hidden="true">
          <span
            v-for="point in trend.points"
            :key="`${trend.key}-${point.date}`"
            :style="{ height: `${trendBarHeight(trend, point.value)}%` }"
          ></span>
        </div>
        <div class="trend-footer">
          <strong>{{ trend.points[trend.points.length - 1].value }}</strong>
          <span>Latest recorded value</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  trends: {
    type: Array,
    default: () => []
  }
})

const trendBarHeight = (trend, value) => {
  const values = trend.points.map(point => Number(point.value)).filter(Number.isFinite)
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return 52
  return Math.max(18, Math.round(((Number(value) - min) / (max - min)) * 70) + 22)
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

.trend-grid { 
  display: grid; 
  grid-template-columns: repeat(3, minmax(0, 1fr)); 
  gap: 1rem; 
}
.trend-card { display: grid; gap: .8rem; }
.trend-heading { 
  display: flex; 
  align-items: flex-start; 
  justify-content: space-between; 
  gap: 1rem; 
}
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
.trend-footer { 
  display: flex; 
  align-items: baseline; 
  justify-content: space-between; 
  gap: 1rem; 
}
.trend-footer strong { color: #163b59; font-size: 1.2rem; font-variant-numeric: tabular-nums; }
.trend-footer span { color: #7b8d98; font-size: .7rem; }

@media (max-width: 900px) {
  .trend-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .trends-section {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .trend-grid { grid-template-columns: 1fr; }
}
</style>
