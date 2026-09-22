<template>
  <section v-if="urgentAlert" class="urgent-alert" aria-labelledby="urgent-alert-title" role="alert">
    <div class="alert-mark" aria-hidden="true"><i class="fas fa-exclamation"></i></div>
    <div class="alert-copy">
      <p class="section-kicker">Urgent care alert</p>
      <h2 id="urgent-alert-title">{{ urgentAlert.title }}</h2>
      <p>{{ urgentAlert.reason }}</p>
      <small>
        {{ urgentAlert.action_type === 'seek_emergency_care' ? 'If you have severe or rapidly worsening symptoms, seek emergency care now.' : 'Please contact the clinic for guidance.' }}
      </small>
    </div>
    <a v-if="urgentAlert.action_type === 'seek_emergency_care'" class="button button-danger" href="tel:999">Seek emergency help</a>
    <a v-else class="button button-danger" href="tel:+8809666747470">Contact the clinic</a>
  </section>
</template>

<script setup>
defineProps({
  urgentAlert: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.urgent-alert { 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  align-items: center; 
  gap: 1.25rem; 
  padding: 1.25rem 1.45rem; 
  border: 1px solid #f87171; 
  border-radius: 18px; 
  color: #fff; 
  background: linear-gradient(135deg, #991b1b, #b91c1c); 
  box-shadow: 0 12px 28px rgba(185, 28, 28, .24); 
}

.alert-mark { 
  display: grid; 
  place-items: center; 
  width: 44px; 
  height: 44px; 
  border-radius: 12px; 
  color: #fff; 
  background: rgba(255, 255, 255, .16); 
  font-size: 1.2rem; 
}

.alert-copy h2 { 
  margin: .15rem 0 .3rem; 
  color: #fff; 
  font-size: 1.2rem; 
  font-weight: 800;
}
.alert-copy p { margin: 0; color: #fee2e2; font-size: .88rem; }
.alert-copy small { display: block; margin-top: .4rem; color: #fecaca; font-size: .75rem; }

.section-kicker { 
  margin: 0; 
  color: #fca5a5; 
  font-size: .72rem; 
  font-weight: 800; 
  letter-spacing: .13em; 
  text-transform: uppercase; 
}

.button { 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  gap: .55rem; 
  min-height: 42px; 
  padding: .65rem 1.15rem; 
  border-radius: 10px; 
  font-size: .84rem; 
  font-weight: 750; 
  text-decoration: none; 
  cursor: pointer; 
  white-space: nowrap; 
}

.button-danger { 
  border: 1px solid rgba(255, 255, 255, .2); 
  color: #991b1b; 
  background: #fff; 
}
.button-danger:hover { background: #fff5f5; }

@media (max-width: 640px) {
  .urgent-alert { 
    grid-template-columns: auto 1fr; 
  }
  .urgent-alert .button { 
    grid-column: 1 / -1; 
    width: 100%; 
  }
}
</style>
