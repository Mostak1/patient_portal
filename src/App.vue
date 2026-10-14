<template>
  <div class="portal-shell" :class="{ 'print-hide': $route.name === 'PrescriptionPrint' }">
    <a class="skip-link" href="#main-content">Skip to content</a>
    
    <!-- Top Sticky Header -->
    <header class="portal-header">
      <div class="portal-header-inner">
        <RouterLink class="portal-brand" to="/" aria-label="American Wellness Center patient portal home">
          <img class="portal-logo" :src="logo" alt="American Wellness Center">
          <span><strong>American Wellness Center</strong><small>Patient portal</small></span>
        </RouterLink>

        <!-- Desktop Navigation Bar -->
        <nav v-if="authState.token && !authState.mustResetPassword" class="portal-nav" aria-label="Primary navigation">
          <RouterLink :class="{ active: isNavActive('#overview') }" :to="{ name: 'Dashboard', hash: '#overview' }" @click="scrollToSection('#overview')">Overview</RouterLink>
          <RouterLink :class="{ active: isNavActive('#appointments') }" :to="{ name: 'Dashboard', hash: '#appointments' }" @click="scrollToSection('#appointments')">Appointments</RouterLink>
          <RouterLink :class="{ active: isNavActive('#reports') }" :to="{ name: 'Dashboard', hash: '#reports' }" @click="scrollToSection('#reports')">Reports</RouterLink>
          <RouterLink :class="{ active: isNavActive('#prescriptions') }" :to="{ name: 'Dashboard', hash: '#prescriptions' }" @click="scrollToSection('#prescriptions')">Prescriptions</RouterLink>
          <RouterLink :class="{ active: isNavActive('#lifestyle') }" :to="{ name: 'Dashboard', hash: '#lifestyle' }" @click="scrollToSection('#lifestyle')">Lifestyle</RouterLink>
          <RouterLink class="nav-btn-book" to="/book-appointment"><i class="fas fa-calendar-plus"></i> Book Visit</RouterLink>
        </nav>

        <div class="portal-header-actions">
          <button v-if="authState.token" type="button" @click="handleLogout" :disabled="isLoggingOut" class="logout-button" aria-label="Sign out">
            <i class="fas fa-arrow-right-from-bracket" aria-hidden="true"></i>
            <span class="logout-text">{{ isLoggingOut ? 'Signing out' : 'Sign out' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main id="main-content" :class="mainClasses" tabindex="-1">
      <router-view />
    </main>

    <!-- Mobile Fixed Bottom Navigation Bar -->
    <nav v-if="authState.token && !authState.mustResetPassword" class="portal-bottom-nav print-hide" aria-label="Mobile navigation">
      <div class="bottom-nav-inner">
        <RouterLink 
          class="bottom-nav-item" 
          :class="{ active: isNavActive('#overview') }" 
          :to="{ name: 'Dashboard', hash: '#overview' }"
          @click="scrollToSection('#overview')"
        >
          <div class="bottom-nav-icon-wrap">
            <i class="fas fa-house-medical" aria-hidden="true"></i>
          </div>
          <span>Overview</span>
        </RouterLink>

        <RouterLink 
          class="bottom-nav-item" 
          :class="{ active: isNavActive('#appointments') }" 
          :to="{ name: 'Dashboard', hash: '#appointments' }"
          @click="scrollToSection('#appointments')"
        >
          <div class="bottom-nav-icon-wrap">
            <i class="fas fa-calendar-check" aria-hidden="true"></i>
          </div>
          <span>Visits</span>
        </RouterLink>

        <RouterLink 
          class="bottom-nav-item" 
          :class="{ active: isNavActive('#reports') }" 
          :to="{ name: 'Dashboard', hash: '#reports' }"
          @click="scrollToSection('#reports')"
        >
          <div class="bottom-nav-icon-wrap">
            <i class="fas fa-file-waveform" aria-hidden="true"></i>
          </div>
          <span>Reports</span>
        </RouterLink>

        <RouterLink 
          class="bottom-nav-item" 
          :class="{ active: isNavActive('#prescriptions') }" 
          :to="{ name: 'Dashboard', hash: '#prescriptions' }"
          @click="scrollToSection('#prescriptions')"
        >
          <div class="bottom-nav-icon-wrap">
            <i class="fas fa-prescription-bottle-medical" aria-hidden="true"></i>
          </div>
          <span>Rx</span>
        </RouterLink>

        <RouterLink 
          class="bottom-nav-item" 
          :class="{ active: $route.name === 'BookAppointment' }" 
          to="/book-appointment"
        >
          <div class="bottom-nav-icon-wrap" style="color: #0e7490;">
            <i class="fas fa-calendar-plus" aria-hidden="true"></i>
          </div>
          <span>Book</span>
        </RouterLink>
      </div>
    </nav>

    <footer class="portal-footer">
      <div>
        <span>American Wellness Center</span>
        <small>Educational information and clinician-recorded guidance</small>
      </div>
      <small>© {{ currentYear }} AWC. All rights reserved.</small>
    </footer>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authState, logout } from './services/portalApi'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isLoggingOut = ref(false)
    const logo = '/logo_hr-1.webp'
    const currentYear = new Date().getFullYear()
    const activeSection = ref('#overview')

    let isManualScrolling = false
    let manualScrollTimeout = null

    const sectionIds = ['overview', 'appointments', 'reports', 'prescriptions', 'lifestyle']

    const updateActiveSection = () => {
      if (typeof window === 'undefined') return
      if (route.name !== 'Dashboard' && route.name !== 'Home') return

      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
      const windowHeight = window.innerHeight
      const fullHeight = document.documentElement.scrollHeight

      // When reaching near the bottom of page, highlight the last section
      if (scrollPos + windowHeight >= fullHeight - 80) {
        activeSection.value = '#lifestyle'
        return
      }

      const offsetThreshold = 150
      let current = 'overview'

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.getBoundingClientRect().top
          if (top <= offsetThreshold) {
            current = id
          }
        }
      }

      activeSection.value = `#${current}`
    }

    const onScroll = () => {
      if (!isManualScrolling) {
        updateActiveSection()
      }
    }

    const isNavActive = (hash) => {
      if (route.name === 'Report') {
        return hash === '#reports'
      }
      if (route.name === 'Prescription' || route.name === 'PrescriptionPrint') {
        return hash === '#prescriptions'
      }
      if (route.name === 'Dashboard' || route.name === 'Home') {
        return activeSection.value === hash
      }
      return (route.hash || '#overview') === hash
    }

    const handleSessionExpired = () => {
      if (route.name !== 'Login') router.replace({ name: 'Login', query: { redirect: route.fullPath, reason: 'expired' } })
    }

    const handleMustResetPassword = () => {
      if (route.name !== 'ForcePasswordReset') router.replace({ name: 'ForcePasswordReset' })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('patient-portal:session-expired', handleSessionExpired)
      window.addEventListener('patient-portal:must-reset-password', handleMustResetPassword)
    }

    onMounted(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        setTimeout(updateActiveSection, 150)
      }
    })

    onBeforeUnmount(() => { 
      if (typeof window !== 'undefined') {
        window.removeEventListener('patient-portal:session-expired', handleSessionExpired)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
      if (manualScrollTimeout) clearTimeout(manualScrollTimeout)
    })

    watch(() => route.fullPath, () => {
      if (route.name === 'Dashboard' || route.name === 'Home') {
        if (route.hash) {
          activeSection.value = route.hash
        } else {
          activeSection.value = '#overview'
        }
        setTimeout(updateActiveSection, 150)
      }
    })

    const mainClasses = computed(() => route.name === 'Report' ? 'portal-main portal-main-report' : 'portal-main')

    const scrollToSection = (hash) => {
      activeSection.value = hash
      if (route.name === 'Dashboard' || route.name === 'Home') {
        isManualScrolling = true
        if (manualScrollTimeout) clearTimeout(manualScrollTimeout)
        manualScrollTimeout = setTimeout(() => {
          isManualScrolling = false
          updateActiveSection()
        }, 800)

        setTimeout(() => {
          const el = document.querySelector(hash)
          if (el) {
            const headerOffset = 75
            const elementPosition = el.getBoundingClientRect().top
            const offsetPosition = elementPosition + (window.pageYOffset || window.scrollY || 0) - headerOffset
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            })
          }
        }, 15)
      }
    }

    return {
      route,
      logo,
      currentYear,
      mainClasses,
      authState,
      isLoggingOut,
      activeSection,
      isNavActive,
      scrollToSection,
      handleLogout: async () => {
        if (isLoggingOut.value) return
        isLoggingOut.value = true
        try { await logout() } finally { isLoggingOut.value = false; router.replace({ name: 'Login' }) }
      },
    }
  },
}
</script>

<style>
.portal-shell { 
  min-height: 100dvh; 
  display: flex; 
  flex-direction: column; 
  color: #294e62; 
  background: #f5f9f9; 
}

.portal-header { 
  position: sticky; 
  top: 0; 
  z-index: 30; 
  border-bottom: 1px solid #dce6e8; 
  background: rgba(255, 255, 255, .95); 
  backdrop-filter: blur(14px); 
}

.portal-header-inner { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 1.25rem; 
  width: min(100% - 2rem, 1240px); 
  min-height: 74px; 
  margin: 0 auto; 
}

.portal-brand { 
  display: inline-flex; 
  align-items: center; 
  gap: .75rem; 
  color: #163b59; 
  text-decoration: none; 
}
.portal-brand:hover { color: #0f766e; }
.portal-logo { width: auto; height: 42px; }
.portal-brand span { display: grid; gap: .1rem; }
.portal-brand strong { font-size: .91rem; letter-spacing: -.01em; }
.portal-brand small { color: #718695; font-size: .7rem; }

.portal-nav { 
  display: flex; 
  align-self: stretch; 
  align-items: center; 
  gap: .25rem; 
  margin-left: auto; 
}

.portal-nav a { 
  display: inline-flex; 
  align-items: center; 
  height: 100%; 
  padding: 0 .8rem; 
  border-bottom: 2px solid transparent; 
  color: #68808d; 
  font-size: .82rem; 
  font-weight: 700; 
  text-decoration: none; 
  transition: color .15s ease, border-color .15s ease;
}

.portal-nav a:hover, 
.portal-nav a.active { 
  color: #0f766e; 
  border-bottom-color: #0f766e; 
}

.portal-nav a.nav-btn-book {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #0e7490 !important;
  color: #fff !important;
  height: 34px !important;
  padding: 0 0.85rem !important;
  border-radius: 8px !important;
  border-bottom: none !important;
  margin-left: 0.5rem;
}

.portal-nav a.nav-btn-book:hover {
  background: #155e75 !important;
  color: #fff !important;
}

.portal-header-actions { 
  display: flex; 
  align-items: center; 
  gap: .7rem; 
}

.logout-button { 
  display: inline-flex; 
  align-items: center; 
  gap: .45rem; 
  min-height: 38px; 
  padding: .45rem .75rem; 
  border: 1px solid #bdd6db; 
  border-radius: 10px; 
  color: #164e63; 
  background: #fff; 
  font-size: .78rem; 
  font-weight: 750; 
  cursor: pointer; 
  transition: background-color .18s ease, border-color .18s ease, transform .18s ease; 
  touch-action: manipulation;
}

.logout-button:hover { 
  border-color: #0f766e; 
  background: #f2fbfa; 
}
.logout-button:active { 
  transform: translateY(1px) scale(.98); 
}
.logout-button:disabled { 
  cursor: wait; 
  opacity: .62; 
}

.portal-main { 
  width: min(100% - 2rem, 1240px); 
  margin: 0 auto; 
  padding: 2rem 0 3.5rem; 
  flex: 1; 
}

.portal-main-report { 
  width: 100%; 
  padding: 0; 
}

/* Mobile Fixed Bottom Navigation */
.portal-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 45;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid #dce6e8;
  box-shadow: 0 -4px 20px rgba(15, 59, 89, 0.08);
  padding-bottom: max(0.35rem, env(safe-area-inset-bottom));
}

.bottom-nav-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  max-width: 520px;
  margin: 0 auto;
  min-height: 58px;
  padding: 0.25rem 0.5rem;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.35rem 0.2rem;
  border-radius: 12px;
  color: #718894;
  text-decoration: none;
  font-size: 0.68rem;
  font-weight: 700;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.12s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav-icon-wrap {
  display: grid;
  place-items: center;
  width: 32px;
  height: 24px;
  border-radius: 10px;
  font-size: 1.15rem;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.bottom-nav-item:hover {
  color: #0f766e;
}

.bottom-nav-item:active {
  transform: scale(0.95);
}

.bottom-nav-item.active {
  color: #0f766e;
  font-weight: 800;
}

.bottom-nav-item.active .bottom-nav-icon-wrap {
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
}

.portal-footer { 
  display: flex; 
  justify-content: space-between; 
  gap: 1rem; 
  padding: 1.25rem max(1rem, calc((100% - 1240px) / 2)); 
  color: #66808c; 
  border-top: 1px solid #dce6e8; 
  background: #eef5f5; 
  font-size: .72rem; 
}
.portal-footer div { display: grid; gap: .22rem; }
.portal-footer span { color: #335d6f; font-weight: 750; }
.portal-footer small { font-size: .7rem; }

.skip-link { 
  position: fixed; 
  top: .5rem; 
  left: .5rem; 
  z-index: 60; 
  padding: .7rem .9rem; 
  color: #fff; 
  background: #163b59; 
  transform: translateY(-160%); 
  transition: transform .18s ease; 
}
.skip-link:focus { transform: translateY(0); }

@media (max-width: 900px) { 
  .portal-header-inner { min-height: 66px; }
  .portal-nav a { padding: 0 .5rem; font-size: .78rem; } 
}

/* Mobile Screens */
@media (max-width: 768px) {
  /* Hide desktop header nav on mobile, use bottom nav */
  .portal-nav {
    display: none;
  }

  /* Hide brand text on mobile so only the clean logo is displayed */
  .portal-brand span {
    display: none;
  }

  .portal-bottom-nav {
    display: block;
  }

  .portal-header-inner { 
    width: min(100% - 1.25rem, 1240px); 
    min-height: 56px; 
    padding: .35rem 0;
  }

  .portal-logo { 
    height: 36px; 
  }

  .portal-header-actions { margin-left: auto; }
  .logout-button { min-height: 34px; padding: .4rem .65rem; font-size: .74rem; border-radius: 8px; }

  /* Account for bottom navigation dock */
  .portal-main { 
    width: min(100% - 1.25rem, 1240px); 
    padding: 1.2rem 0 calc(4.75rem + env(safe-area-inset-bottom)); 
  }
  
  .portal-main-report { 
    width: 100%; 
    padding: 0 0 calc(4.5rem + env(safe-area-inset-bottom)); 
  }

  .portal-footer { 
    flex-direction: column; 
    padding: 1rem .75rem calc(5rem + env(safe-area-inset-bottom)); 
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) { 
  .portal-header, .portal-bottom-nav { backdrop-filter: none; }
  .logout-button, .skip-link, .bottom-nav-item { transition: none; } 
}

@media print { 
  .portal-header, .portal-bottom-nav, .portal-footer, .skip-link { display: none !important; } 
}
</style>

