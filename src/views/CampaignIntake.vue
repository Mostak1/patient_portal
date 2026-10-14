<template>
  <div class="campaign-intake-page">
    <div class="intake-container">
      <div class="intake-hero">
        <div class="clinic-badge">
          <i class="fas fa-heart-pulse"></i>
          <span>American Wellness Center</span>
        </div>
        <h1>Request a Clinical Consultation</h1>
        <p class="intake-tagline">
          Connect with our specialist team for personalized healthcare, advanced diagnostics, and wellness programs.
        </p>
      </div>

      <div class="intake-card">
        <!-- Success Confirmation -->
        <div v-if="success" class="success-box" role="status">
          <div class="success-icon">
            <i class="fas fa-circle-check"></i>
          </div>
          <h2>Request Received!</h2>
          <p class="success-msg">{{ successMessage }}</p>
          <div v-if="leadReference" class="ref-badge">
            Reference ID: <strong>{{ leadReference }}</strong>
          </div>
          <p class="followup-note">
            <i class="fas fa-phone-volume"></i> Our care team will call your registered number within working hours to confirm your consultation schedule.
          </p>
          <button type="button" class="btn btn-primary" @click="resetForm">Submit Another Inquiry</button>
        </div>

        <!-- Intake Form -->
        <form v-else @submit.prevent="handleSubmit" novalidate>
          <div class="form-section-title">
            <i class="fas fa-user-circle"></i> Personal Information
          </div>

          <div class="form-grid">
            <div class="field-group">
              <label for="visitor-name">Full Name <span class="required">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-user field-icon" aria-hidden="true"></i>
                <input
                  id="visitor-name"
                  v-model.trim="form.name"
                  required
                  placeholder="e.g. Mohammad Rahman"
                >
              </div>
            </div>

            <div class="field-group">
              <label for="visitor-mobile">Contact Mobile Number <span class="required">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-phone field-icon" aria-hidden="true"></i>
                <input
                  id="visitor-mobile"
                  v-model.trim="form.mobile"
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                >
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="field-group">
              <label for="visitor-email">Email Address</label>
              <div class="input-wrap">
                <i class="fas fa-envelope field-icon" aria-hidden="true"></i>
                <input
                  id="visitor-email"
                  v-model.trim="form.email"
                  type="email"
                  placeholder="name@example.com"
                >
              </div>
            </div>

            <div class="field-group">
              <label for="visitor-city">City / Area</label>
              <div class="input-wrap">
                <i class="fas fa-location-dot field-icon" aria-hidden="true"></i>
                <input
                  id="visitor-city"
                  v-model.trim="form.city"
                  placeholder="e.g. Gulshan, Dhaka"
                >
              </div>
            </div>
          </div>

          <div class="form-section-title" style="margin-top: 1.5rem;">
            <i class="fas fa-notes-medical"></i> Medical Consultation Details
          </div>

          <div class="field-group">
            <label for="visitor-service">Service or Department of Interest</label>
            <div class="input-wrap select-wrap">
              <i class="fas fa-stethoscope field-icon" aria-hidden="true"></i>
              <select id="visitor-service" v-model="form.service_of_interest" class="form-select">
                <option value="">Select a clinical service...</option>
                <option value="General Health Checkup">General Health Checkup</option>
                <option value="Specialist Doctor Consultation">Specialist Doctor Consultation</option>
                <option value="Acupuncture & Natural Care">Acupuncture & Natural Care</option>
                <option value="Physiotherapy & Rehabilitation">Physiotherapy & Rehabilitation</option>
                <option value="Diagnostic & Lab Testing">Diagnostic & Lab Testing</option>
                <option value="Nutrition & Diet Consultation">Nutrition & Diet Consultation</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <label for="visitor-issue">Primary Health Concern or Question</label>
            <textarea
              id="visitor-issue"
              v-model="form.medical_issue"
              rows="3"
              class="form-textarea"
              placeholder="Tell us briefly about any symptoms, past history, or test you wish to undergo..."
            ></textarea>
          </div>

          <!-- Hidden Honeypot Field for anti-bot validation -->
          <div style="display: none;" aria-hidden="true">
            <input v-model="form.website" type="text" tabindex="-1" autocomplete="off">
          </div>

          <p v-if="error" class="form-error" role="alert">
            <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
            <span>{{ error }}</span>
          </p>

          <button class="intake-submit" type="submit" :disabled="submitting || !form.name || !form.mobile">
            <span v-if="submitting" class="button-loader" aria-hidden="true"></span>
            <span>{{ submitting ? 'Submitting request...' : 'Submit Consultation Request' }}</span>
            <i v-if="!submitting" class="fas fa-paper-plane" aria-hidden="true"></i>
          </button>
        </form>

        <div class="intake-footer">
          <p class="privacy-note">
            <i class="fas fa-shield-halved"></i> Your health data remains strictly confidential and will only be used by authorized clinic staff to coordinate care.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { submitCampaignIntake } from '../services/portalApi'

const route = useRoute()

const form = reactive({
  name: '',
  mobile: '',
  email: '',
  city: '',
  service_of_interest: '',
  medical_issue: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: '',
  referral_url: '',
  website: '', // Honeypot
})

const submitting = ref(false)
const error = ref('')
const success = ref(false)
const successMessage = ref('')
const leadReference = ref('')

onMounted(() => {
  // Capture campaign attribution parameters from URL query string
  form.utm_source = (route.query.utm_source || route.query.source || '').toString()
  form.utm_medium = (route.query.utm_medium || '').toString()
  form.utm_campaign = (route.query.utm_campaign || route.query.campaign || '').toString()
  form.utm_term = (route.query.utm_term || '').toString()
  form.utm_content = (route.query.utm_content || '').toString()
  form.referral_url = typeof document !== 'undefined' ? document.referrer : ''
})

const handleSubmit = async () => {
  error.value = ''
  if (!form.name || !form.mobile) {
    error.value = 'Please provide your full name and mobile number.'
    return
  }

  submitting.value = true
  try {
    const res = await submitCampaignIntake(form)
    if (res.success) {
      success.value = true
      successMessage.value = res.message
      leadReference.value = res.lead_reference || ''
    } else {
      error.value = res.message || 'Unable to submit request.'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'A network error occurred. Please try calling clinic reception.'
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.mobile = ''
  form.email = ''
  form.city = ''
  form.service_of_interest = ''
  form.medical_issue = ''
  success.value = false
  leadReference.value = ''
}
</script>

<style scoped>
.campaign-intake-page {
  padding: 3rem 1rem 5rem;
  background: linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%);
  min-height: calc(100dvh - 120px);
}

.intake-container {
  max-width: 680px;
  margin: 0 auto;
}

.intake-hero {
  text-align: center;
  margin-bottom: 2rem;
}

.clinic-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(14, 116, 144, 0.1);
  color: #0e7490;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
}

.intake-hero h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.intake-tagline {
  color: #475569;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 auto;
  max-width: 520px;
}

.intake-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 2.25rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section-title i {
  color: #0e7490;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.field-group {
  margin-bottom: 1.25rem;
}

.field-group label {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.4rem;
}

.required {
  color: #dc2626;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.95rem;
  pointer-events: none;
}

.input-wrap input, .form-select, .form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  font-size: 0.95rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;
}

.form-textarea {
  padding: 0.75rem 1rem;
  resize: vertical;
}

.input-wrap input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #0e7490;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.15);
}

.form-error {
  color: #dc2626;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.intake-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: #0e7490;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.intake-submit:hover:not(:disabled) {
  background: #155e75;
}

.intake-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.intake-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.privacy-note {
  font-size: 0.78rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

/* Success Box */
.success-box {
  text-align: center;
  padding: 1.5rem 0.5rem;
}

.success-icon {
  font-size: 3rem;
  color: #059669;
  margin-bottom: 1rem;
}

.success-box h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.success-msg {
  color: #475569;
  font-size: 0.95rem;
  max-width: 440px;
  margin: 0 auto 1.25rem;
}

.ref-badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.92rem;
  margin-bottom: 1.5rem;
}

.followup-note {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: 1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #334155;
  max-width: 460px;
  margin: 0 auto 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.btn-primary {
  background: #0e7490;
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.button-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
