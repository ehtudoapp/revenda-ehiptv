<template>
  <div class="app-root">
    <Login v-if="!authenticated" @success="onLoginSuccess" />

    <div v-else class="app-layout">
    <Sidebar :route="route" @navigate="route = $event" @logout="onLogout" :open="sidebarOpen" @close="sidebarOpen = false" />

      <main class="content">
        <header class="header">
      <div>Bem-vindo, <strong>{{ user.username }}</strong></div>
      <div class="credits">Créditos: <strong>{{ user.credits }}</strong></div>
      <button class="menu-button" @click="sidebarOpen = !sidebarOpen" aria-label="Abrir menu">☰</button>
        </header>

        <Home v-if="route==='home'" :user="user" />
        <GerarTeste v-if="route==='gerar-teste'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Login from './pages/Login.vue'
import Home from './pages/Home.vue'
import GerarTeste from './pages/GerarTeste.vue'
import Sidebar from './components/Sidebar.vue'


// in dev we open the app already authenticated so you can work on visuals
const authenticated = ref(false)

// route is driven by the URL hash (e.g. #/home or #/gerar-teste)
const route = ref('home')
const sidebarOpen = ref(false)
// user state (was provided by the mock previously)
const user = ref({ username: '', credits: 0 })

function routeFromHash() {
  const h = (location.hash || '').replace(/^#\/?/, '')
  return h || 'home'
}

onMounted(() => {
  // initialize from current hash
  route.value = routeFromHash()

  // listen to back/forward and manual hash changes
  window.addEventListener('hashchange', () => {
    route.value = routeFromHash()
  })
})

// keep the URL hash in sync when route changes programmatically
watch(route, (r) => {
  const expected = '#/' + r
  if (location.hash !== expected) location.hash = expected
})

function onLoginSuccess(payload) {
  authenticated.value = true
  user.value = payload.user
}

function onLogout() {
  authenticated.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('secret')
  user.value = { username: '', credits: 0 }
}
</script>

<style>
.app-root { min-height: 100vh; display: flex; flex-direction: column; }
html, body, #app { height: 100%; }
:root { --card-bg: rgba(255,255,255,0.04); --card-border: rgba(255,255,255,0.06); --accent: #3b82f6 }

.app-layout { display: flex; min-height: calc(100vh - 0px); }
.sidebar { width: 13.75rem; flex-shrink: 0; }
.content { flex: 1 1 auto; padding: 1.5rem; min-height: 100vh; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem }

.menu-button { display:none; background:transparent; border:1px solid rgba(255,255,255,0.06); color:inherit; padding:0.35rem 0.6rem; border-radius:0.375rem }

@media (max-width: 768px) { /* 768px */
  .content { padding: 1rem; }
  /* show mobile menu button */
  .menu-button { display:block; font-size:1.25rem; padding:0.45rem 0.8rem }
  /* keep layout single-column */
  .app-layout { flex-direction: column; }
}

@media (prefers-color-scheme: light) { :root { --card-bg:#fff; --card-border:#e6e9ee; --accent:#2563eb } }
</style>
