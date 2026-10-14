<template>
  <section class="forgot-page" aria-labelledby="forgot-title">
    <div class="forgot-card">
      <div class="forgot-badge">
        <i class="fas fa-key" aria-hidden="true"></i>
      </div>

      <div class="forgot-heading">
        <p class="section-kicker">Self-service Recovery</p>
        <h1 id="forgot-title">Forgot your password?</h1>
        <p>
          Enter your registered mobile number or Patient ID. If an email is linked to your clinic file, we will send you a secure password reset link.
        </p>
      </div>

      <div v-if="successMessage" class="forgot-message forgot-message-success" role="status">
        <i class="fas fa-circle-check" aria-hidden="true"></i>
        <div>
          <strong>Reset instructions sent</strong>
          <p>{{ successMessage }}</p>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit" novalidate>
        <div class="field-group">
          <label for="identifier">Registered mobile number or Patient ID</label>
          <div class="input-wrap">
            <i class="fas fa-phone field-icon" aria-hidden="true"></i>
            <input
              id="identifier"
              v-model.trim="identifier"
              required
              autocomplete="tel"
              placeholder="e.g. 01XXXXXXXXX or Patient ID"
            >
          </div>
          <small class="field-help">Enter the mobile number linked to your patient file at American Wellness Center.</small>
        </div>

        <div class="field-group">
          <label for="email-address">Registered email address (optional)</label>
          <div class="input-wrap">
            <i class="fas fa-envelope field-icon" aria-hidden="true"></i>
            <input
              id="email-address"
              v-model.trim="email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
            >
          </div>
          <small class="field-help">Enter your email if you want to verify against your profile.</small>
        </div>

        <p v-if="error" class="form-error" role="alert">
          <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
          <span>{{ error }}</span>
        </p>

        <button class="forgot-submit" type="submit" :disabled="loading || !identifier">
          <span v-if="loading" class="button-loader" aria-hidden="true"></span>
          <span>{{ loading ? 'Sending reset link...' : 'Send reset instructions' }}</span>
          <i v-if="!loading" class="fas fa-paper-plane" aria-hidden="true"></i>
        </button>
      </form>

      <div class="forgot-card-footer">
        <div class="call-center-notice">
          <i class="fas fa-headset" aria-hidden="true"></i>
          <div>
            <strong>Need assistance over the phone?</strong>
            <p>Our call center can verify your identity and issue an instant temporary access password.</p>
          </div>
        </div>

        <RouterLink to="/login" class="back-link">
          <i class="fas fa-arrow-left"></i> Back to sign in
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { forgotPassword } from '../services/portalApi'

const identifier = ref('')
const email = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  error.value = ''
  if (!identifier.value) {
    error.value = 'Please provide your registered mobile number or Patient ID.'
    return
  }

  loading.value = true
  try {
    const res = await forgotPassword(identifier.value, email.value || null)
    successMessage.value = res.message || 'If this account is registered, password reset instructions have been sent.'
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to process password reset request. Please contact clinic reception.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 180px);
  padding: 2.5rem 1rem;
}

.forgot-card {
  width: 100%;
  max-width: 480px;
  background: var(--surface-primary, #ffffff);
  border: 1px solid var(--border-subtle, #e2e8f0);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.forgot-badge {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(14, 116, 144, 0.1);
  color: #0e7490;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.forgot-heading .section-kicker {
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #0e7490;
  margin-bottom: 0.25rem;
}

.forgot-heading h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.forgot-heading p {
  color: #475569;
  font-size: 0.93rem;
  line-height: 1.5;
  margin-bottom: 1.75rem;
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
}

.input-wrap input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  font-size: 0.95rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.input-wrap input:focus {
  outline: none;
  border-color: #0e7490;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.15);
}

.field-help {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.form-error {
  color: #dc2626;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.forgot-message-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  font-size: 0.92rem;
  margin-bottom: 1.5rem;
}

.forgot-message-success p {
  margin: 0.25rem 0 0;
  font-size: 0.86rem;
  color: #047857;
}

.forgot-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: #0e7490;
  color: #fff;
  font-weight: 600;
  font-size: 0.98rem;
  padding: 0.95rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.forgot-submit:hover:not(:disabled) {
  background: #155e75;
}

.forgot-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-card-footer {
  margin-top: 1.75rem;
  display: grid;
  gap: 1.25rem;
}

.call-center-notice {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: #475569;
}

.call-center-notice strong {
  display: block;
  color: #0f172a;
}

.call-center-notice p {
  margin: 0.15rem 0 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #0e7490;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
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
