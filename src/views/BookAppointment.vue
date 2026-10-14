<template>
  <div class="booking-page">
    <div class="booking-container">
      <!-- Breadcrumb & Header -->
      <div class="booking-header">
        <RouterLink to="/dashboard" class="back-link">
          <i class="fas fa-arrow-left" aria-hidden="true"></i> Back to Dashboard
        </RouterLink>
        <h1>Book a Clinic Appointment</h1>
        <p class="booking-subtitle">Select your preferred branch, doctor, and convenient time slot for in-person consultation.</p>
      </div>

      <!-- Stepper Indicator -->
      <div class="stepper" aria-label="Appointment booking steps">
        <div class="step-item" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
          <div class="step-circle"><i v-if="currentStep > 1" class="fas fa-check"></i><span v-else>1</span></div>
          <span class="step-label">Branch</span>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
        <div class="step-item" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
          <div class="step-circle"><i v-if="currentStep > 2" class="fas fa-check"></i><span v-else>2</span></div>
          <span class="step-label">Doctor</span>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
        <div class="step-item" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
          <div class="step-circle"><i v-if="currentStep > 3" class="fas fa-check"></i><span v-else>3</span></div>
          <span class="step-label">Date & Time</span>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 3 }"></div>
        <div class="step-item" :class="{ active: currentStep === 4, completed: isConfirmed }">
          <div class="step-circle"><i v-if="isConfirmed" class="fas fa-check"></i><span v-else>4</span></div>
          <span class="step-label">Confirm</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert-box alert-error" role="alert">
        <i class="fas fa-circle-exclamation"></i>
        <span>{{ error }}</span>
      </div>

      <!-- SUCCESS CONFIRMATION VIEW -->
      <div v-if="isConfirmed" class="confirmed-card">
        <div class="confirmed-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <h2>Appointment Request Submitted!</h2>
        <p class="confirmed-desc">
          Your appointment has been registered. Our reception desk will verify and send you an SMS confirmation.
        </p>

        <div class="summary-details">
          <div class="summary-row">
            <span class="summary-key">Appointment Number:</span>
            <span class="summary-val highlight">{{ confirmedData.appointment_number }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-key">Date & Time:</span>
            <span class="summary-val">{{ confirmedData.request_date }} ({{ confirmedData.slot }})</span>
          </div>
          <div class="summary-row">
            <span class="summary-key">Doctor:</span>
            <span class="summary-val">{{ selectedDoctor?.first_name }} {{ selectedDoctor?.last_name }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-key">Clinic Location:</span>
            <span class="summary-val">{{ selectedLocation?.name }}</span>
          </div>
        </div>

        <div class="confirmed-actions">
          <RouterLink to="/dashboard" class="btn btn-primary">Go to Dashboard</RouterLink>
          <button type="button" class="btn btn-secondary" @click="resetBooking">Book Another Appointment</button>
        </div>
      </div>

      <!-- STEP 1: SELECT BRANCH LOCATION -->
      <div v-else-if="currentStep === 1" class="step-content">
        <h2 class="step-title"><i class="fas fa-location-dot"></i> Choose Branch Location</h2>
        <p class="step-desc">Select the clinic branch you wish to visit.</p>

        <div v-if="loadingLocations" class="loading-state">
          <div class="spinner"></div> Loading available branches...
        </div>

        <div v-else class="locations-grid">
          <div
            v-for="loc in locations"
            :key="loc.id"
            class="location-card"
            :class="{ selected: selectedLocation?.id === loc.id }"
            @click="selectLocation(loc)"
          >
            <div class="location-icon">
              <i class="fas fa-hospital"></i>
            </div>
            <div class="location-info">
              <h3>{{ loc.name }}</h3>
              <p v-if="loc.city || loc.state" class="location-address">
                <i class="fas fa-map-pin"></i> {{ [loc.city, loc.state].filter(Boolean).join(', ') }}
              </p>
              <p v-if="loc.mobile" class="location-phone">
                <i class="fas fa-phone"></i> {{ loc.mobile }}
              </p>
            </div>
            <div class="location-check">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="step-nav">
          <div></div>
          <button class="btn btn-primary" :disabled="!selectedLocation" @click="goToStep(2)">
            Next: Select Doctor <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- STEP 2: SELECT DOCTOR -->
      <div v-else-if="currentStep === 2" class="step-content">
        <h2 class="step-title"><i class="fas fa-user-doctor"></i> Select Doctor or Specialist</h2>
        <p class="step-desc">Showing clinicians available at <strong>{{ selectedLocation?.name }}</strong>.</p>

        <div v-if="loadingDoctors" class="loading-state">
          <div class="spinner"></div> Loading doctors...
        </div>

        <div v-else-if="doctors.length === 0" class="empty-state">
          <i class="fas fa-user-slash"></i>
          <p>No clinicians currently scheduled at this branch location. Please try selecting another location.</p>
        </div>

        <div v-else class="doctors-grid">
          <div
            v-for="doc in doctors"
            :key="doc.id"
            class="doctor-card"
            :class="{ selected: selectedDoctor?.id === doc.id }"
            @click="selectDoctor(doc)"
          >
            <div class="doctor-avatar">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="doctor-info">
              <h3>{{ doc.first_name }} {{ doc.last_name }}</h3>
              <span class="doctor-designation">{{ doc.designation || 'Consultant' }}</span>
              <span v-if="doc.specialist" class="doctor-specialty">{{ doc.specialist }}</span>
              <span v-if="doc.room" class="doctor-room"><i class="fas fa-door-open"></i> Room: {{ doc.room }}</span>
            </div>
            <div class="doctor-check">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="step-nav">
          <button class="btn btn-secondary" @click="goToStep(1)">
            <i class="fas fa-arrow-left"></i> Change Branch
          </button>
          <button class="btn btn-primary" :disabled="!selectedDoctor" @click="goToStep(3)">
            Next: Select Time Slot <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- STEP 3: SELECT DATE & TIME SLOT -->
      <div v-else-if="currentStep === 3" class="step-content">
        <h2 class="step-title"><i class="fas fa-clock"></i> Choose Consultation Date & Slot</h2>
        <p class="step-desc">Doctor: <strong>{{ selectedDoctor?.first_name }} {{ selectedDoctor?.last_name }}</strong> at <strong>{{ selectedLocation?.name }}</strong></p>

        <!-- Date Selection -->
        <div class="date-selection-box">
          <label class="form-label">Available Dates</label>
          <div v-if="loadingDates" class="loading-state">
            <div class="spinner"></div> Finding available consultation dates...
          </div>
          <div v-else-if="availableDates.length === 0" class="empty-state">
            <i class="fas fa-calendar-xmark"></i>
            <p>No open dates found in the next 30 days for this doctor. Please check with reception or choose another clinician.</p>
          </div>
          <div v-else class="date-chips-wrap">
            <button
              v-for="d in availableDates"
              :key="d"
              type="button"
              class="date-chip"
              :class="{ selected: selectedDate === d }"
              @click="selectDate(d)"
            >
              <span class="chip-weekday">{{ formatWeekday(d) }}</span>
              <span class="chip-date">{{ formatDateDay(d) }}</span>
            </button>
          </div>
        </div>

        <!-- Slot Selection -->
        <div v-if="selectedDate" class="slots-box">
          <label class="form-label">Available Time Slots for {{ selectedDate }}</label>
          <div v-if="loadingSlots" class="loading-state">
            <div class="spinner"></div> Checking open slots...
          </div>
          <div v-else-if="slots.length === 0" class="empty-state">
            <i class="fas fa-hourglass-end"></i>
            <p>No available slots on this date. Please choose another date above.</p>
          </div>
          <div v-else class="slots-grid">
            <button
              v-for="slot in slots"
              :key="slot.index"
              type="button"
              class="slot-btn"
              :class="{
                selected: selectedSlot?.index === slot.index,
                disabled: !slot.is_available
              }"
              :disabled="!slot.is_available"
              @click="selectSlot(slot)"
            >
              <span class="slot-time">{{ slot.time_label }}</span>
              <span class="slot-capacity-badge" :class="slot.is_available ? 'badge-open' : 'badge-full'">
                {{ slot.is_available ? `${slot.available} spots left` : 'Full' }}
              </span>
            </button>
          </div>
        </div>

        <div class="step-nav">
          <button class="btn btn-secondary" @click="goToStep(2)">
            <i class="fas fa-arrow-left"></i> Change Doctor
          </button>
          <button class="btn btn-primary" :disabled="!selectedDate || !selectedSlot" @click="goToStep(4)">
            Next: Review & Confirm <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- STEP 4: REVIEW & CONFIRM -->
      <div v-else-if="currentStep === 4" class="step-content">
        <h2 class="step-title"><i class="fas fa-clipboard-check"></i> Review & Submit Request</h2>
        <p class="step-desc">Please verify your booking details before confirmation.</p>

        <div class="review-card">
          <div class="review-item">
            <span class="review-label"><i class="fas fa-hospital"></i> Branch</span>
            <span class="review-value">{{ selectedLocation?.name }}</span>
          </div>
          <div class="review-item">
            <span class="review-label"><i class="fas fa-user-doctor"></i> Doctor</span>
            <span class="review-value">{{ selectedDoctor?.first_name }} {{ selectedDoctor?.last_name }} ({{ selectedDoctor?.specialist || 'Consultant' }})</span>
          </div>
          <div class="review-item">
            <span class="review-label"><i class="fas fa-calendar-day"></i> Consultation Date</span>
            <span class="review-value">{{ selectedDate }}</span>
          </div>
          <div class="review-item">
            <span class="review-label"><i class="fas fa-clock"></i> Time Slot</span>
            <span class="review-value">{{ selectedSlot?.time_label }}</span>
          </div>
        </div>

        <div class="field-group" style="margin-top: 1.5rem;">
          <label for="booking-remarks">Consultation Reason or Symptoms (Optional)</label>
          <textarea
            id="booking-remarks"
            v-model="bookingRemarks"
            rows="3"
            class="form-textarea"
            placeholder="Briefly state your primary complaint or reason for visit..."
          ></textarea>
        </div>

        <div class="step-nav">
          <button class="btn btn-secondary" @click="goToStep(3)">
            <i class="fas fa-arrow-left"></i> Back to Slot
          </button>
          <button class="btn btn-primary btn-confirm" :disabled="submitting" @click="submitBooking">
            <span v-if="submitting" class="spinner"></span>
            <span>{{ submitting ? 'Confirming Appointment...' : 'Confirm Appointment' }}</span>
            <i v-if="!submitting" class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getBookingLocations,
  getBookingDoctors,
  getBookingAvailableDates,
  getBookingAvailableSlots,
  bookAppointment,
} from '../services/portalApi'

const router = useRouter()

const currentStep = ref(1)
const error = ref('')
const submitting = ref(false)
const isConfirmed = ref(false)
const confirmedData = ref(null)

const locations = ref([])
const loadingLocations = ref(false)
const selectedLocation = ref(null)

const doctors = ref([])
const loadingDoctors = ref(false)
const selectedDoctor = ref(null)

const availableDates = ref([])
const loadingDates = ref(false)
const selectedDate = ref('')

const slots = ref([])
const loadingSlots = ref(false)
const selectedSlot = ref(null)

const bookingRemarks = ref('')

onMounted(async () => {
  loadingLocations.value = true
  try {
    const res = await getBookingLocations()
    locations.value = res.data || []
    if (locations.value.length === 1) {
      selectLocation(locations.value[0])
    }
  } catch (err) {
    error.value = 'Failed to load clinic locations. Please try again.'
  } finally {
    loadingLocations.value = false
  }
})

const selectLocation = (loc) => {
  selectedLocation.value = loc
  selectedDoctor.value = null
  selectedDate.value = ''
  selectedSlot.value = null
}

const selectDoctor = (doc) => {
  selectedDoctor.value = doc
  selectedDate.value = ''
  selectedSlot.value = null
}

const selectDate = async (date) => {
  selectedDate.value = date
  selectedSlot.value = null
  loadingSlots.value = true
  try {
    const res = await getBookingAvailableSlots(
      selectedDoctor.value.id,
      date,
      selectedLocation.value.id
    )
    slots.value = res.data || []
  } catch (err) {
    error.value = 'Failed to load slots for this date.'
  } finally {
    loadingSlots.value = false
  }
}

const selectSlot = (slot) => {
  if (slot.is_available) {
    selectedSlot.value = slot
  }
}

const goToStep = async (step) => {
  error.value = ''
  if (step === 2 && selectedLocation.value) {
    loadingDoctors.value = true
    try {
      const res = await getBookingDoctors(selectedLocation.value.id)
      doctors.value = res.data || []
      currentStep.value = 2
    } catch (err) {
      error.value = 'Failed to load doctors for this location.'
    } finally {
      loadingDoctors.value = false
    }
  } else if (step === 3 && selectedDoctor.value) {
    loadingDates.value = true
    try {
      const res = await getBookingAvailableDates(
        selectedLocation.value.id,
        selectedDoctor.value.id
      )
      availableDates.value = res.data || []
      currentStep.value = 3
    } catch (err) {
      error.value = 'Failed to load available dates.'
    } finally {
      loadingDates.value = false
    }
  } else {
    currentStep.value = step
  }
}

const submitBooking = async () => {
  error.value = ''
  submitting.value = true
  try {
    const payload = {
      doctor_profile_id: selectedDoctor.value.id,
      location_id: selectedLocation.value.id,
      calendar_date: selectedDate.value,
      slot_time: selectedSlot.value.time_label,
      slot_index: selectedSlot.value.index,
      remarks: bookingRemarks.value || 'Booked via Patient Portal',
    }
    const res = await bookAppointment(payload)
    if (res.success) {
      confirmedData.value = res.data
      isConfirmed.value = true
    } else {
      error.value = res.message || 'Booking could not be completed.'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred while booking. Please try another time slot.'
  } finally {
    submitting.value = false
  }
}

const resetBooking = () => {
  isConfirmed.value = false
  confirmedData.value = null
  selectedDate.value = ''
  selectedSlot.value = null
  bookingRemarks.value = ''
  currentStep.value = 1
}

const formatWeekday = (dateStr) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  } catch {
    return ''
  }
}

const formatDateDay = (dateStr) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.booking-page {
  padding: 2.5rem 1rem 4rem;
  background: var(--surface-bg, #f8fafc);
  min-height: calc(100dvh - 120px);
}

.booking-container {
  max-width: 860px;
  margin: 0 auto;
}

.booking-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0e7490;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 0.75rem;
}

.back-link:hover {
  text-decoration: underline;
}

.booking-header h1 {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.4rem;
}

.booking-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 1.25rem 2rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.88rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #cbd5e1;
  transition: all 0.2s ease;
}

.step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
}

.step-item.active .step-circle {
  background: #0e7490;
  color: #fff;
  border-color: #0e7490;
}

.step-item.active .step-label {
  color: #0e7490;
}

.step-item.completed .step-circle {
  background: #059669;
  color: #fff;
  border-color: #059669;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: -1.2rem 0.75rem 0;
  transition: background 0.2s ease;
}

.step-connector.active {
  background: #059669;
}

/* Step Content Box */
.step-content {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.step-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.step-title i {
  color: #0e7490;
}

.step-desc {
  color: #64748b;
  font-size: 0.92rem;
  margin: 0 0 1.75rem;
}

/* Locations Grid */
.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.location-card {
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  position: relative;
  transition: all 0.2s ease;
}

.location-card:hover {
  border-color: #0e7490;
  background: #f8fafc;
}

.location-card.selected {
  border-color: #0e7490;
  background: #f0fdfa;
}

.location-icon {
  font-size: 1.5rem;
  color: #0e7490;
  padding-top: 0.15rem;
}

.location-info h3 {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: #0f172a;
}

.location-address, .location-phone {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.location-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #059669;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.location-card.selected .location-check {
  opacity: 1;
}

/* Doctors Grid */
.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.doctor-card {
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  position: relative;
  transition: all 0.2s ease;
}

.doctor-card:hover {
  border-color: #0e7490;
  background: #f8fafc;
}

.doctor-card.selected {
  border-color: #0e7490;
  background: #f0fdfa;
}

.doctor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0369a1;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.doctor-info h3 {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  color: #0f172a;
}

.doctor-designation {
  display: block;
  font-size: 0.82rem;
  color: #475569;
}

.doctor-specialty {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  margin-top: 0.35rem;
}

.doctor-room {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.3rem;
}

.doctor-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #059669;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.doctor-card.selected .doctor-check {
  opacity: 1;
}

/* Date Chips */
.date-chips-wrap {
  display: flex;
  gap: 0.65rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}

.date-chip {
  min-width: 80px;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  transition: all 0.2s ease;
}

.date-chip:hover {
  border-color: #0e7490;
}

.date-chip.selected {
  background: #0e7490;
  border-color: #0e7490;
  color: #fff;
}

.chip-weekday {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
}

.date-chip.selected .chip-weekday {
  color: #e0f2fe;
}

.chip-date {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.date-chip.selected .chip-date {
  color: #fff;
}

/* Slots Grid */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.75rem;
}

.slot-btn {
  padding: 0.85rem;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
}

.slot-btn:hover:not(.disabled) {
  border-color: #0e7490;
  background: #f0fdfa;
}

.slot-btn.selected {
  background: #0e7490;
  border-color: #0e7490;
  color: #fff;
}

.slot-btn.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: #f1f5f9;
}

.slot-time {
  font-weight: 700;
  font-size: 0.95rem;
}

.slot-capacity-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.badge-open {
  background: #dcfce7;
  color: #166534;
}

.slot-btn.selected .badge-open {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.badge-full {
  background: #fee2e2;
  color: #991b1b;
}

/* Review Card */
.review-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 0.75rem;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-label {
  color: #64748b;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-value {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.92rem;
}

.form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.92rem;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #0e7490;
  box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.12);
}

/* Confirmed Card */
.confirmed-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
}

.confirmed-icon {
  width: 64px;
  height: 64px;
  background: #dcfce7;
  color: #166534;
  font-size: 2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 1.5rem;
}

.confirmed-card h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.confirmed-desc {
  color: #64748b;
  max-width: 480px;
  margin: 0 auto 2rem;
  font-size: 0.95rem;
}

.summary-details {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  max-width: 480px;
  margin: 0 auto 2rem;
  display: grid;
  gap: 0.75rem;
  text-align: left;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.summary-key {
  color: #64748b;
}

.summary-val {
  font-weight: 700;
  color: #0f172a;
}

.summary-val.highlight {
  color: #0e7490;
}

.confirmed-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Nav & Buttons */
.step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #edf2f7;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  font-weight: 700;
  font-size: 0.92rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0e7490;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #155e75;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #059669;
}

.btn-confirm:hover:not(:disabled) {
  background: #047857;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
  font-size: 0.92rem;
}

.empty-state i {
  font-size: 2rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  display: block;
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
