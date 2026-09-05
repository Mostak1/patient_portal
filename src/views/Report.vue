<template>
  <div class="report-container">

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-blue-600 text-lg">Loading your lab report...</p>
    </div>

    <!-- Report in iframe - Full Width but with proper height -->
    <div v-else-if="reportUrl" class="w-full h-[calc(108vh-200px)]">
      <iframe 
        :src="reportUrl" 
        class="w-full h-full border-0"
        frameborder="0"
        @load="onIframeLoad"
      >
      </iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const reportUrl = ref('')
const error = ref('')
const loading = ref(true)

const onIframeLoad = () => {
  // Iframe loaded successfully
  console.log('Iframe loaded successfully')
}

onMounted(async () => {
    const invoice = route.params.id
    const mobile = route.query.mobile

    try {
        const response = await axios.get(`https://erp.awcbd.org/api/lab-result/${invoice}/${mobile}`)
        if (response.data) {
            reportUrl.value = `https://erp.awcbd.org/api/lab-result/${invoice}/${mobile}`
        } else {
            error.value = 'No report found for the provided details.'
        }
    } catch (e) {
        if (e.response && e.response.data) {
            if (e.response.data.message === "Invalid credentials.") {
                error.value = 'Invalid invoice number or mobile number. Please check your credentials and try again.'
            } else {
                error.value = e.response.data.message || 'Failed to load report.'
            }
        } else {
            error.value = 'Network error. Please check your internet connection and try again.'
        }
        console.error('API Error:', e)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.report-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Hide double scrollbar */
:deep(html) {
  overflow: hidden;
}

:deep(body) {
  margin: 0;
  padding: 0;
}
</style>