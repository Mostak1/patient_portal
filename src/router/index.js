import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Report from '../views/Report.vue'
import Prescription from '../views/Prescription.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ForcePasswordReset from '../views/ForcePasswordReset.vue'
import BookAppointment from '../views/BookAppointment.vue'
import CampaignIntake from '../views/CampaignIntake.vue'
import { authState, isSessionValid } from '../services/portalApi'

const routes = [
  { path: '/', name: 'Home', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/force-password-reset', name: 'ForcePasswordReset', component: ForcePasswordReset, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/book-appointment', name: 'BookAppointment', component: BookAppointment, meta: { requiresAuth: true } },
  { path: '/intake', name: 'CampaignIntake', component: CampaignIntake },
  { path: '/book-consultation', name: 'BookConsultation', component: CampaignIntake },
  { path: '/report/:id', name: 'Report', component: Report, props: true, meta: { requiresAuth: true } },
  { path: '/prescription/:id', name: 'Prescription', component: Prescription, props: true, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 85, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const loggedIn = isSessionValid()

  // 1. If route requires authentication and not logged in -> redirect to login
  if (to.meta.requiresAuth && !loggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // 2. If logged in and must reset password:
  if (loggedIn && authState.mustResetPassword) {
    if (to.name !== 'ForcePasswordReset') {
      return { name: 'ForcePasswordReset' }
    }
    return
  }

  // 3. If logged in without reset requirement and trying to access Login or ForcePasswordReset -> redirect to Dashboard
  if (loggedIn && (to.name === 'Login' || to.name === 'ForcePasswordReset')) {
    return { name: 'Dashboard' }
  }
})

export default router
