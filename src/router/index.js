import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Report from '../views/Report.vue'
import Prescription from '../views/Prescription.vue'
import { isSessionValid } from '../services/portalApi'

const routes = [
  { path: '/', name: 'Home', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
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
  if (to.meta.requiresAuth && !isSessionValid()) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Login' && isSessionValid()) {
    return { name: 'Dashboard' }
  }
})

export default router
