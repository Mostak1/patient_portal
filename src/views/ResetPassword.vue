<template>
  <section class="reset-page" aria-labelledby="reset-title">
    <div class="reset-card">
      <div class="reset-badge">
        <i class="fas fa-lock" aria-hidden="true"></i>
      </div>

      <div class="reset-heading">
        <p class="section-kicker">Security Setup</p>
        <h1 id="reset-title">Set new password</h1>
        <p>
          Enter your new secure password to reset your credentials for American Wellness Center Patient Portal.
        </p>
      </div>

      <div v-if="successMessage" class="reset-message reset-message-success" role="status">
        <i class="fas fa-circle-check" aria-hidden="true"></i>
        <div>
          <strong>Password reset complete!</strong>
          <p>{{ successMessage }}</p>
          <RouterLink to="/login" class="login-now-btn">Go to sign in</RouterLink>
        </div>
      </div>

      <form v-else @submit.prevent="handleReset" novalidate>
        <div class="field-group">
          <label for="customer-id">Customer ID</label>
          <div class="input-wrap">
            <i class="fas fa-id-card field-icon" aria-hidden="true"></i>
            <input
              id="customer-id"
              v-model.trim="customerId"
              required
              readonly
              class="readonly-input"
            >
          </div>
        </div>

        <div class="field-group">
          <label for="new-password">New password</label>
          <div class="input-wrap">
            <i class="fas fa-key field-icon" aria-hidden="true"></i>
            <input
              id="new-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="At least 8 characters"
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
        </div>

        <!-- Rules Checklist -->
        <div class="password-rules-card">
          <ul class="rules-list">
            <li :class="{ met: rules.length }">
              <i :class="rules.length ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              At least 8 characters
            </li>
            <li :class="{ met: rules.uppercase }">
              <i :class="rules.uppercase ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              Uppercase letter
            </li>
            <li :class="{ met: rules.lowercase }">
              <i :class="rules.lowercase ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              Lowercase letter
            </li>
            <li :class="{ met: rules.number }">
              <i :class="rules.number ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              Number (0-9)
            </li>
            <li :class="{ met: rules.special }">
              <i :class="rules.special ? 'fas fa-check-circle' : 'far fa-circle'"></i>
              Special symbol (@$!%*#?&_-)
            </li>
          </ul>
        </div>

        <div class="field-group">
          <label for="confirm-password">Confirm new password</label>
          <div class="input-wrap">
            <i class="fas fa-shield-check field-icon" aria-hidden="true"></i>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Re-enter your password"
            >
          </div>
        </div>

        <p v-if="error" class="form-error" role="alert">
          <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
          <span>{{ error }}</span>
        </p>

        <button class="reset-submit" type="submit" :disabled="loading || !isPasswordValid">
          <span v-if="loading" class="button-loader" aria-hidden="true"></span>
          <span>{{ loading ? 'Resetting password...' : 'Confirm & save password' }}</span>
          <i v-if="!loading" class="fas fa-check" aria-hidden="true"></i>
        </button>
      </form>

      <div class="reset-card-footer">
        <RouterLink to="/login" class="back-link">
          <i class="fas fa-arrow-left"></i> Return to sign in
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '../services/portalApi'

const route = useRoute()
const router = useRouter()

const customerId = ref(route.query.customer_id || '')
const token = ref(route.query.token || '')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

onMounted(() => {
  if (!token.value || !customerId.value) {
    error.value = 'Invalid password reset link. Please request a new link from the forgot password page.'
  }
})

const rules = computed(() => {
  const pwd = newPassword.value
  return {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[@$!%*#?&_\-]/.test(pwd),
  }
})

const isPasswordValid = computed(() => {
  return (
    rules.value.length &&
    rules.value.uppercase &&
    rules.value.lowercase &&
    rules.value.number &&
    rules.value.special &&
    confirmPassword.value.length > 0 &&
    token.value.length > 0
  )
})

const handleReset = async () => {
  error.value = ''
  if (!token.value || !customerId.value) {
    error.value = 'Reset token is missing or invalid.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Password confirmation does not match.'
    return
  }

  loading.value = true
  try {
    const res = await resetPassword(customerId.value, token.value, newPassword.value, confirmPassword.value)
    successMessage.value = res.message || 'Password has been reset successfully.'
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reset password. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 180px);
  padding: 2.5rem 1rem;
}

.reset-card {
  width: 100%;
  max-width: 480px;
  background: var(--surface-primary, #ffffff);
  border: 1px solid var(--border-subtle, #e2e8f0);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.reset-badge {
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

.reset-heading .section-kicker {
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #0e7490;
  margin-bottom: 0.25rem;
}

.reset-heading h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.reset-heading p {
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
  padding: 0.85rem 2.8rem 0.85rem 2.75rem;
  font-size: 0.95rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.input-wrap input.readonly-input {
  background: #f1f5f9;
  color: #475569;
  cursor: not-allowed;
}

.input-wrap input:focus:not(.readonly-input) {
  outline: none;
  border-color: #0e7490;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.15);
}

.toggle-visibility {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.95rem;
}

.password-rules-card {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.35rem;
}

.rules-list li {
  font-size: 0.82rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rules-list li.met {
  color: #059669;
  font-weight: 600;
}

.form-error {
  color: #dc2626;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reset-message-success {
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

.login-now-btn {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #059669;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
}

.reset-submit {
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

.reset-submit:hover:not(:disabled) {
  background: #155e75;
}

.reset-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-card-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
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
