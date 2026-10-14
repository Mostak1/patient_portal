<template>
  <section class="login-page" aria-labelledby="login-title">
    <div class="login-introduction">
      <div class="login-header-badge">
        <div class="login-mark" aria-hidden="true">
          <i class="fas fa-heart-pulse"></i>
        </div>
        <div>
          <p class="login-kicker">American Wellness Center</p>
          <span class="login-portal-tag">Patient Portal</span>
        </div>
      </div>
      <h1 id="login-title">Your health records, in one calm place.</h1>
      <p class="login-desc">Sign in to view your reports, prescriptions, care-team notes, and recorded lifestyle guidance.</p>
      <div class="login-trust-list">
        <span class="trust-item"><i class="fas fa-lock" aria-hidden="true"></i> Secure patient session</span>
        <span class="trust-item"><i class="fas fa-shield-halved" aria-hidden="true"></i> Your records stay private</span>
      </div>
    </div>

    <div class="login-card">
      <div class="login-card-heading">
        <p class="section-kicker">Patient Portal</p>
        <h2>Sign in</h2>
        <p>Use your Patient ID and password to access your health portal.</p>
      </div>

      <div v-if="sessionExpiredMessage" class="login-message login-message-warning" role="status">
        <i class="fas fa-clock" aria-hidden="true"></i>
        <span>{{ sessionExpiredMessage }}</span>
      </div>

      <div v-if="locked" class="login-message login-message-warning" role="alert">
        <i class="fas fa-hourglass-half" aria-hidden="true"></i>
        <span>Too many attempts. Please wait and try again later.</span>
      </div>

      <form @submit.prevent="submitLogin" novalidate>
        <div class="field-group">
          <label for="patient-id">Patient ID</label>
          <div class="input-wrap">
            <i class="fas fa-id-card field-icon" aria-hidden="true"></i>
            <input 
              id="patient-id" 
              v-model.trim="patientId" 
              required 
              autocomplete="username" 
              placeholder="e.g. CO2294087" 
              :aria-invalid="Boolean(error && !patientId)" 
              aria-describedby="patient-id-help"
            >
          </div>
          <small id="patient-id-help">Found on your clinic prescription, receipt, or member card.</small>
        </div>

        <div class="field-group">
          <div class="field-label-row">
            <label for="portal-password">Password</label>
            <RouterLink to="/forgot-password" class="forgot-link">Forgot password?</RouterLink>
          </div>
          <div class="input-wrap">
            <i class="fas fa-lock field-icon" aria-hidden="true"></i>
            <input 
              id="portal-password" 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              autocomplete="current-password" 
              placeholder="Enter password or clinic default" 
            >
            <button 
              type="button" 
              class="toggle-visibility" 
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" aria-hidden="true"></i>
            </button>
          </div>
          <small id="password-help">Initial login? Use default password provided by clinic reception.</small>
        </div>

        <p v-if="error" class="form-error" role="alert">
          <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
          <span>{{ error }}</span>
        </p>

        <button class="login-submit" type="submit" :disabled="loading || locked">
          <span v-if="loading" class="button-loader" aria-hidden="true"></span>
          <span>{{ loading ? 'Checking your details...' : 'Continue securely' }}</span>
          <i v-if="!loading" class="fas fa-arrow-right" aria-hidden="true"></i>
        </button>
      </form>

      <div class="login-card-footer">
        <p class="login-help">
          <i class="fas fa-circle-question" aria-hidden="true"></i>
          <span>Need help? Contact clinic reception or the call center for phone verification.</span>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../services/portalApi'

const router = useRouter()
const route = useRoute()
const patientId = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const locked = ref(false)
const sessionExpiredMessage = route.query.reason === 'expired' ? 'Your secure session expired. Please sign in again.' : ''

const submitLogin = async () => {
  error.value = ''
  locked.value = false
  if (!patientId.value) {
    error.value = 'Please enter your Patient ID.'
    return
  }
  loading.value = true
  try {
    const res = await login(patientId.value, password.value || null)
    if (res.must_reset_password) {
      router.replace({ name: 'ForcePasswordReset' })
    } else {
      router.replace(route.query.redirect || { name: 'Dashboard' })
    }
  } catch (requestError) {
    if (requestError.response?.status === 429) {
      locked.value = true
      error.value = 'Login is temporarily locked due to too many attempts. Please try again later.'
    } else {
      error.value = requestError.response?.data?.message || 'Invalid credentials.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 440px);
  align-items: center;
  justify-content: center;
  gap: clamp(2rem, 6vw, 6rem);
  min-height: min(720px, calc(100dvh - 180px));
  padding: 2.5rem clamp(1rem, 4vw, 3.5rem);
  box-sizing: border-box;
}

.login-introduction {
  max-width: 36rem;
}

.login-header-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.login-mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  font-size: 1.25rem;
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.22);
  flex-shrink: 0;
}

.login-kicker {
  margin: 0;
  color: #0f766e;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.login-portal-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #627d8d;
}

.login-introduction h1 {
  max-width: 14ch;
  margin: 0;
  color: #163b59;
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  line-height: 1.06;
  letter-spacing: -0.04em;
  text-wrap: balance;
  font-weight: 800;
}

.login-desc {
  max-width: 32rem;
  margin: 1.25rem 0 0;
  color: #5b7381;
  font-size: 1.05rem;
  line-height: 1.65;
}

.login-trust-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 2rem;
  color: #496c7b;
  font-size: 0.82rem;
  font-weight: 700;
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(15, 118, 110, 0.07);
  border-radius: 999px;
  color: #0f766e;
}

.trust-item i {
  font-size: 0.85rem;
}

.login-card {
  padding: clamp(1.4rem, 4vw, 2.2rem);
  border: 1px solid #dce6e8;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 20px 45px rgba(15, 59, 89, 0.08), 0 2px 6px rgba(15, 59, 89, 0.03);
  position: relative;
  box-sizing: border-box;
}

.login-card-heading h2 {
  margin: 0.25rem 0 0.35rem;
  color: #163b59;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.login-card-heading > p:not(.section-kicker) {
  margin: 0;
  color: #6d818c;
  font-size: 0.86rem;
  line-height: 1.5;
}

.section-kicker {
  margin: 0;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.login-card form {
  display: grid;
  gap: 1.15rem;
  margin-top: 1.5rem;
}

.field-group {
  display: grid;
  gap: 0.42rem;
}

.field-group label {
  color: #294e62;
  font-size: 0.84rem;
  font-weight: 750;
  letter-spacing: -0.01em;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.forgot-link {
  font-size: 0.78rem;
  color: #0f766e;
  font-weight: 600;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.toggle-visibility {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.4rem;
  font-size: 0.92rem;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.95rem;
  color: #94a7b0;
  font-size: 0.95rem;
  pointer-events: none;
  transition: color 0.18s ease;
}

.field-group input {
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  padding: 0.75rem 0.95rem 0.75rem 2.6rem;
  border: 1.5px solid #cbdde2;
  border-radius: 12px;
  outline: none;
  color: #163b59;
  background: #fbfdfd;
  font-size: 16px; /* Prevents auto-zoom on iOS */
  line-height: 1.4;
  font-family: inherit;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  touch-action: manipulation;
}

.field-group input::placeholder {
  color: #9db0b8;
  font-size: 0.92rem;
}

.input-wrap:focus-within .field-icon {
  color: #0f766e;
}

.field-group input:focus {
  border-color: #0f766e;
  background: #fff;
  box-shadow: 0 0 0 3.5px rgba(15, 118, 110, 0.14);
}

.field-group input[aria-invalid="true"] {
  border-color: #dc2626;
  background: #fffafa;
}

.field-group small {
  color: #7b909a;
  font-size: 0.72rem;
  line-height: 1.35;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.65rem 0.8rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #b91c1c;
  font-size: 0.8rem;
  line-height: 1.4;
  font-weight: 600;
}

.login-message {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1.1rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  font-size: 0.8rem;
  line-height: 1.4;
}

.login-message-warning {
  color: #854d0e;
  border: 1px solid #fde047;
  background: #fefce8;
}

.login-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 50px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, #0f766e 0%, #0d6b63 100%);
  font-size: 0.94rem;
  font-weight: 750;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(15, 118, 110, 0.25);
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  touch-action: manipulation;
}

.login-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #115e59 0%, #0f544f 100%);
  box-shadow: 0 8px 22px rgba(15, 118, 110, 0.32);
  transform: translateY(-1px);
}

.login-submit:active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
  box-shadow: 0 3px 10px rgba(15, 118, 110, 0.2);
}

.login-submit:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
}

.button-loader {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.8s linear infinite;
}

.login-card-footer {
  margin-top: 1.4rem;
  padding-top: 1rem;
  border-top: 1px solid #edf3f4;
}

.login-help {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin: 0;
  color: #7d919a;
  font-size: 0.75rem;
  line-height: 1.45;
  text-align: left;
}

.login-help i {
  color: #0f766e;
  margin-top: 0.15rem;
  flex-shrink: 0;
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

/* Profile Picker Styles (Shared Mobile Number) */
.profile-picker-view {
  animation: fadeIn 0.25s ease-out;
}

.picker-header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.picker-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 0.75rem;
  border-radius: 16px;
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
  font-size: 1.4rem;
}

.picker-header h2 {
  margin: 0;
  color: #163b59;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.picker-header p {
  margin: 0.45rem 0 0;
  color: #5b7381;
  font-size: 0.88rem;
  line-height: 1.45;
}

.profile-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1.5px solid #e1ebf0;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.profile-item:hover:not(:disabled) {
  border-color: #0f766e;
  background: #f0fdfa;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(15, 118, 110, 0.1);
}

.profile-item:active:not(:disabled) {
  transform: scale(0.99);
}

.profile-avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex-grow: 1;
  min-width: 0;
}

.profile-name {
  color: #163b59;
  font-size: 0.96rem;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-meta {
  color: #647b88;
  font-size: 0.76rem;
  line-height: 1.3;
}

.profile-arrow {
  color: #94a3b8;
  font-size: 0.85rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.profile-item:hover .profile-arrow {
  color: #0f766e;
  transform: translateX(3px);
}

.picker-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: transparent;
  color: #647b88;
  font-size: 0.85rem;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-back-btn:hover {
  border-color: #0f766e;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.04);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Tablet & Mobile Layout Adjustments */
@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
    gap: 1.75rem;
    min-height: 0;
    max-width: 520px;
    margin: 0 auto;
    padding: 1.5rem 1rem 2rem;
  }

  .login-introduction {
    max-width: 100%;
    text-align: center;
  }

  .login-header-badge {
    justify-content: center;
    margin-bottom: 0.85rem;
    text-align: left;
  }

  .login-introduction h1 {
    max-width: 100%;
    font-size: clamp(1.6rem, 5.5vw, 2.2rem);
  }

  .login-desc {
    max-width: 100%;
    margin-top: 0.5rem;
    font-size: 0.92rem;
  }

  .login-trust-list {
    justify-content: center;
    margin-top: 1rem;
    gap: 0.65rem;
  }
}

/* Small Mobile Screens (e.g. iPhone, Pixel, Galaxy) */
@media (max-width: 640px) {
  .login-page {
    gap: 1rem;
    padding: 0.75rem 0.5rem 1.5rem;
  }

  /* Header already contains AWC logo/brand, hide redundant badge on small screens */
  .login-header-badge {
    display: none;
  }

  .login-introduction h1 {
    font-size: 1.45rem;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }

  .login-desc {
    font-size: 0.82rem;
    line-height: 1.45;
    margin-top: 0.35rem;
    color: #647b88;
  }

  .login-trust-list {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 0.75rem;
  }

  .trust-item {
    font-size: 0.7rem;
    padding: 0.25rem 0.55rem;
  }

  .login-card {
    padding: 1.25rem 1.1rem;
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(15, 59, 89, 0.06);
  }

  .login-card-heading h2 {
    font-size: 1.35rem;
    margin-top: 0.15rem;
  }

  .login-card-heading > p:not(.section-kicker) {
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .section-kicker {
    font-size: 0.68rem;
  }

  .login-card form {
    gap: 0.9rem;
    margin-top: 1rem;
  }

  .field-group {
    gap: 0.3rem;
  }

  .field-group label {
    font-size: 0.8rem;
  }

  .field-group input {
    min-height: 46px;
    font-size: 16px;
    padding: 0.7rem 0.85rem 0.7rem 2.4rem;
    border-radius: 10px;
  }

  .field-icon {
    left: 0.8rem;
    font-size: 0.88rem;
  }

  .field-group small {
    font-size: 0.68rem;
  }

  .login-submit {
    min-height: 46px;
    font-size: 0.88rem;
    border-radius: 10px;
    margin-top: 0.25rem;
  }

  .login-card-footer {
    margin-top: 1rem;
    padding-top: 0.75rem;
  }

  .login-help {
    font-size: 0.72rem;
  }
}

@media (max-width: 360px) {
  .login-introduction h1 {
    font-size: 1.3rem;
  }
  .login-trust-list {
    flex-direction: column;
    align-items: center;
  }
  .login-card {
    padding: 1rem 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .field-group input, .login-submit, .field-icon {
    transition: none;
  }
  .button-loader {
    animation: none;
  }
}
</style>

