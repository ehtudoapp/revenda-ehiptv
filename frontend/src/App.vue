<template>
  <div class="app-root">
    <Login v-if="!authenticated" @success="onLoginSuccess" />

    <div v-else class="app-layout">
      <Sidebar :route="route" @navigate="route = $event" @logout="onLogout" />

      <main class="content">
        <header class="header">
          <div>Bem-vindo, <strong>{{ user.username }}</strong></div>
          <div class="credits">Créditos: <strong>{{ user.credits }}</strong></div>
        </header>

        <Home v-if="route==='home'" :user="user" />
        <GerarTeste v-if="route==='gerar-teste'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Login from './pages/Login.vue'
import Home from './pages/Home.vue'
import GerarTeste from './pages/GerarTeste.vue'
import Sidebar from './components/Sidebar.vue'

const authenticated = ref(false)
const user = ref({ username: '', credits: 0 })
const route = ref('home')

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
.sidebar { width: 220px; flex-shrink: 0; }
.content { flex: 1 1 auto; padding: 1.5rem; min-height: 100vh; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem }

@media (prefers-color-scheme: light) { :root { --card-bg:#fff; --card-border:#e6e9ee; --accent:#2563eb } }
</style>
