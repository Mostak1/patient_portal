<template>
  <div class="appointments-section" id="appointments">
    <div class="section-header">
      <div>
        <h2 class="section-title"><i class="fas fa-calendar-check"></i> My Appointments</h2>
        <p class="section-subtitle">Live status and history of your clinic consultation bookings</p>
      </div>
      <RouterLink to="/book-appointment" class="btn-book-cta">
        <i class="fas fa-plus"></i> Book Appointment
      </RouterLink>
    </div>

    <div v-if="loading" class="appointments-loading">
      <div class="spinner"></div> Loading your appointments...
    </div>

    <div v-else-if="error" class="appointments-error">
      <i class="fas fa-circle-exclamation"></i> {{ error }}
      <button type="button" class="retry-link" @click="fetchAppointments">Retry</button>
    </div>

    <div v-else-if="appointments.length === 0" class="appointments-empty">
      <div class="empty-icon"><i class="fas fa-calendar-plus"></i></div>
      <h3>No appointments booked yet</h3>
      <p>Need to see a doctor or specialist? Book a visit at any of our branches directly from the portal.</p>
      <RouterLink to="/book-appointment" class="btn-book-empty">
        <i class="fas fa-calendar-plus"></i> Schedule an Appointment
      </RouterLink>
    </div>

    <div v-else class="appointments-grid">
      <div
        v-for="apt in appointments"
        :key="apt.id"
        class="appointment-card"
        :class="`status-${apt.status_badge}`"
      >
        <div class="card-top">
          <span class="apt-number">#{{ apt.appointment_number }}</span>
          <span class="status-badge" :class="`badge-${apt.status_badge}`">
            <i :class="getStatusIcon(apt.status)"></i> {{ apt.status }}
          </span>
        </div>

        <div class="card-main">
          <div class="doctor-summary">
            <div class="doc-icon"><i class="fas fa-user-md"></i></div>
            <div>
              <h4 class="doctor-name">{{ apt.doctor?.name || 'Assigned Clinician' }}</h4>
              <span class="doctor-spec">{{ apt.doctor?.specialist || apt.doctor?.designation || 'Consultation' }}</span>
            </div>
          </div>

          <div class="apt-meta-grid">
            <div class="meta-item">
              <i class="fas fa-calendar-day"></i>
              <span>{{ apt.date }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>{{ apt.slot }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-location-dot"></i>
              <span>{{ apt.location }}</span>
            </div>
            <div v-if="apt.doctor?.room" class="meta-item">
              <i class="fas fa-door-open"></i>
              <span>Room {{ apt.doctor.room }}</span>
            </div>
          </div>

          <p v-if="apt.remarks" class="apt-remarks">
            <i class="fas fa-comment-medical"></i> {{ apt.remarks }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getMyAppointments } from '../../services/portalApi'

const appointments = ref([])
const loading = ref(false)
const error = ref('')

const fetchAppointments = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getMyAppointments()
    appointments.value = res.data || []
  } catch (err) {
    error.value = 'Unable to fetch your appointments at this time.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAppointments()
})

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'fas fa-circle-check'
    case 'visited':
      return 'fas fa-clipboard-check'
    case 'cancelled':
      return 'fas fa-circle-xmark'
    default:
      return 'fas fa-hourglass-half'
  }
}
</script>

<style scoped>
.appointments-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.75rem;
  margin-top: 2rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.section-title i {
  color: #0e7490;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0;
}

.btn-book-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #0e7490;
  color: #fff;
  padding: 0.6rem 1.15rem;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.btn-book-cta:hover {
  background: #155e75;
}

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.appointment-card {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #cbd5e1;
  padding-bottom: 0.65rem;
}

.apt-number {
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.02em;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.badge-warning {
  background: #fef9c3;
  color: #854d0e;
}

.badge-primary {
  background: #e0f2fe;
  color: #0369a1;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.doctor-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0369a1;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
}

.doctor-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.doctor-spec {
  font-size: 0.8rem;
  color: #64748b;
}

.apt-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #334155;
}

.meta-item i {
  color: #0e7490;
  font-size: 0.85rem;
}

.apt-remarks {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  background: #fff;
  padding: 0.4rem 0.65rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.appointments-empty {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  width: 60px;
  height: 60px;
  background: #e0f2fe;
  color: #0e7490;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.75rem;
  margin: 0 auto 1rem;
}

.appointments-empty h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.appointments-empty p {
  color: #64748b;
  max-width: 400px;
  margin: 0 auto 1.5rem;
  font-size: 0.9rem;
}

.btn-book-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #0e7490;
  color: #fff;
  padding: 0.75rem 1.4rem;
  font-weight: 700;
  font-size: 0.92rem;
  border-radius: 10px;
  text-decoration: none;
}

.appointments-loading, .appointments-error {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
  font-size: 0.92rem;
}

.retry-link {
  background: transparent;
  border: none;
  color: #0e7490;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
