<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column - Instructions -->
            <div class="space-y-6">
                <div>
                    <p class="text-sm text-gray-600 uppercase tracking-wide mb-2">WELCOME TO AMERICAN WELLNESS CENTER</p>
                    <h2 class="text-3xl font-bold text-blue-600 mb-6">Get Your Report Easily</h2>
                </div>
                
                <div class="space-y-4 text-gray-700">
                    <p class="text-base">Only pathological reports are available here.</p>
                    
                    <p class="text-base">Please ensure your payment has been completed.</p>
                    
                    <p class="text-base">Use the phone number and ID number found on your receipt.</p>
                    
                    <p class="text-base">
                        Machine-generated reports are available here. For consultant-signed copies, please 
                        collect them from the branch.
                    </p>
                </div>
            </div>

            <!-- Right Column - Report Form -->
            <div class="lg:max-w-md">
                <div class="bg-blue-500 rounded-lg p-6 shadow-lg">
                    <h3 class="text-xl font-semibold text-white mb-6">Get your Report</h3>
                    
                    <form @submit.prevent="fetchData" class="space-y-4">
                        <div>
                            <input 
                                type="text" 
                                v-model="invoiceNumber" 
                                placeholder="Enter Invoice Number*" 
                                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                required
                            >
                        </div>
                        
                        <div>
                            <input 
                                type="tel"
                                v-model="mobileNumber"  
                                placeholder="Enter Mobile Number*" 
                                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                required
                            >
                        </div>
                        
                        <button 
                            type="submit" 
                            class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                            Submit
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
const invoiceNumber = ref('')
const mobileNumber = ref('')
const error = ref('')

const fetchData = async () => {
  error.value = ''
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/v1/customer-reports', {
      params: {
        invoice_number: invoiceNumber.value,
        mobile_number: mobileNumber.value
      }
    })

    if (response.data.success && response.data.data.length > 0) {
      router.push({
        name: 'Report',
        params: { id: invoiceNumber.value },
        query: { mobile: mobileNumber.value }
      })
    } else {
      error.value = 'Report not found. Please verify your invoice and mobile number.'
    }
  } catch (e) {
    error.value = 'API request failed. Please try again.'
  }
}
</script>