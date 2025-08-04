import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Report from '../views/Report.vue'
import Prescription from '../views/Prescription.vue'
import PrescriptionPrint from '../views/PrescriptionPrint.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/report/:id', name: 'Report', component: Report, props: true },
  { path: '/prescription/:id', name: 'Prescription', component: Prescription, props: true },
  { path: '/prescription/:id/print', name: 'PrescriptionPrint', component: PrescriptionPrint, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router