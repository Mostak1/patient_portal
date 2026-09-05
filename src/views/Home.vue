<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Left Column - Instructions -->
    <div class="space-y-6">
      <div>
        <p class="text-sm text-gray-600 uppercase tracking-wide mb-2">WELCOME TO AMERICAN WELLNESS CENTER</p>
        <h2 class="text-3xl font-bold text-blue-600 mb-6">Get Your Documents</h2>
      </div>
      
      <div class="space-y-4 text-gray-700">
        <p class="text-base">Both prescriptions and pathological reports are available here.</p>
        <p class="text-base">Please ensure your payment has been completed.</p>
        <p class="text-base">Use the phone number and invoice number found on your receipt.</p>
        <p class="text-base">
          For consultant-signed copies, please collect them from the branch.
        </p>
      </div>
    </div>

    <!-- Right Column - Form -->
    <div class="lg:max-w-md">
      <div class="bg-blue-500 rounded-lg p-6 shadow-lg">
        <h3 class="text-xl font-semibold text-white mb-6">Get your Document</h3>
        
        <form @submit.prevent="fetchData" class="space-y-4">
          <div>
            <select 
              v-model="documentType"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              required
            >
              <option value="">Select Document Type</option>
              <option value="prescription">Prescription</option>
              <option value="report">Pathology Report</option>
            </select>
          </div>
          
          <div>
            <input 
              type="text" 
              v-model="invoiceNumber" 
              placeholder="Enter Invoice Number*" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              required
              pattern="[0-9]+"
              title="Invoice number should contain only numbers"
            >
          </div>
          
          <div>
            <input 
              type="tel"
              v-model="mobileNumber"  
              placeholder="Enter Mobile Number*" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              required
              pattern="[0-9]{11}"
              title="Mobile number should be 11 digits"
            >
          </div>
          
          <div v-if="error" class="text-red-100 text-sm">
            {{ error }}
          </div>
          
          <button 
            type="submit" 
            class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Loading...' : 'Submit' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const documentType = ref('')
const invoiceNumber = ref('')
const mobileNumber = ref('')
const error = ref('')
const isLoading = ref(false)

const fetchData = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    if (documentType.value === 'report') {
      // Use your new API for lab reports
      const response = await axios.get(`https://erp.awcbd.org/api/lab-result/${invoiceNumber.value}/${mobileNumber.value}`)

      if (response.data) {
        router.push({
          name: 'Report',
          params: { id: invoiceNumber.value },
          query: { mobile: mobileNumber.value }
        })
      } else {
        error.value = response.data?.message || 'Report not found. Please verify your invoice and mobile number.'
      }
    } else if (documentType.value === 'prescription') {
      // Keep existing prescription API
      const response = await axios.get('https://erp.awcbd.org/api/prescriptions/by-details', {
        params: {
          mobile_number: mobileNumber.value,
          invoice_number: invoiceNumber.value
        }
      })

      if (response.data.success && response.data.data) {
        router.push({
          name: 'Prescription',
          params: { id: invoiceNumber.value },
          query: { mobile: mobileNumber.value },
          state: { prescriptionData: response.data.data }
        })
      } else {
        error.value = response.data.message || 'Prescription not found. Please verify your details.'
      }
    }
  } catch (e) {
    // Handle specific error for invalid credentials
    if (e.response && e.response.data && e.response.data.message === "Invalid credentials.") {
      error.value = 'Invalid invoice number or mobile number. Please check your credentials.'
    } else {
      error.value = e.response?.data?.message || 'Document request failed. Please try again.'
    }
    console.error('Fetch Error:', e)
  } finally {
    isLoading.value = false
  }
}
</script>