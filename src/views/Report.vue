<template>
  <div class="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">Available PDF Reports</h2>
    
    <div v-if="loading" class="text-blue-600 text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      Loading...
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-8 bg-red-50 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="reports.length > 0" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Reports</th>
            <th class="text-right py-4 px-6 font-semibold text-gray-700">PDF</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(report, index) in reports" 
            :key="report.id" 
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td class="py-4 px-6 text-gray-800">
              <ul class="list-disc pl-6 space-y-2">
                <li v-for="(product, productIndex) in report.products" :key="productIndex" class="text-base">
                  {{ product }}
                </li>
              </ul>
            </td>
            <td class="py-4 px-6 text-right">
              <a 
                :href="report.report_url" 
                target="_blank" 
                class="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors inline-flex items-center gap-2 text-base">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View PDF
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      No reports found.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const reports = ref([]) // Changed from report to reports (array)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
    const invoice = route.params.id
    const mobile = route.query.mobile

    try {
        const response = await axios.get('https://awc.careneterp.com:84/api/v1/customer-reports', {
            params: {
                invoice_number: invoice,
                mobile_number: mobile
            }
        })

        if (response.data.success && response.data.data.length > 0) {
            reports.value = response.data.data // Store all reports
        } else {
            error.value = 'No reports found.'
        }
    } catch (e) {
        error.value = 'API request failed.'
    } finally {
        loading.value = false
    }
})
</script>