import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Report from '../views/Report.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/report/:id', name: 'Report', component: Report, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
