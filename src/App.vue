<template>
  <div class="bg-gray-50 min-h-screen flex flex-col" :class="{ 'print-hide': $route.name === 'PrescriptionPrint' }">
    <!-- Header - Show for all routes -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <a href="/">
              <img class="h-10 w-auto" :src="logo" alt="American Wellness Center Logo">
            </a>
          </div>
          <div class="text-right">
            <h2 class="text-xl font-semibold text-blue-600">American Wellness Center</h2>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content - Full width for Report, centered for others -->
    <main :class="mainClasses">
      <router-view />
    </main>

    <!-- Footer - Show for all routes -->
    <footer class="bg-blue-600 text-white mt-auto">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <div class="text-center">
          <div class="text-sm">
            © 2025 AWC. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  data() {
    return {
      logo: '/logo_hr-1.webp'
    }
  },
  setup() {
    const route = useRoute()
    
    const mainClasses = computed(() => {
      if (route.name === 'Report') {
        return 'w-full flex-grow overflow-hidden'
      }
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow'
    })

    return {
      mainClasses
    }
  }
}
</script>

<style scoped>
/* Hide header and footer when on PrescriptionPrint route */
.print-hide header,
.print-hide footer {
  display: none;
}

/* Ensure print mode also hides header and footer for PrescriptionPrint */
@media print {
  header,
  footer {
    display: none;
  }
}
</style>