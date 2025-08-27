<template>
  <section class="page">
    <h3>Resumo</h3>
    <p>Usuário: <strong>{{ user.username }}</strong></p>
    <p>Créditos disponíveis: <strong>{{ user.credits }}</strong></p>

    <h3>Clientes</h3>

    <div class="controls" style="margin-top:.5rem">
      <label style="display:inline-flex;align-items:center;gap:0.5rem">
        <input type="checkbox" v-model="hideTrials" />
        <span>Ocultar usuários de teste</span>
      </label>
    </div>

    <div class="clients">
      <div class="today">
        <h4>Expiram hoje</h4>
        <div v-if="loading">Carregando...</div>
        <div v-else-if="expiringToday.length === 0">Nenhum cliente expira hoje.</div>
        <div v-else class="today-list cards">
          <div v-for="c in expiringToday" :key="'today-'+c.id" class="card">
            <div v-if="c.is_trial" class="badge">Teste</div>
            <div class="row"><strong>Usuário:</strong> {{ c.username }}</div>
            <div class="row"><strong>Senha:</strong> {{ c.password }}</div>
            <div class="row"><strong>Data (exp):</strong> {{ formatDate(c.exp_date) }}</div>
            <div class="row"><strong>Teste:</strong> {{ c.is_trial ? 'Sim' : 'Não' }}</div>
            <div class="row"><strong>Notas:</strong> {{ c.reseller_notes || c.admin_notes || '-' }}</div>
          </div>
        </div>
      </div>
  <h4>Todos</h4>
      <div v-if="loading">Carregando clientes...</div>
      <div v-else-if="error" class="error">Erro: {{ error }}</div>
      <div v-else class="cards">
        <div v-if="filteredClients.length===0">Nenhum cliente encontrado.</div>
        <div v-for="c in filteredClients" :key="c.id" class="card">
          <div v-if="c.is_trial" class="badge">Teste</div>
          <div class="row"><strong>Usuário:</strong> {{ c.username }}</div>
          <div class="row"><strong>Senha:</strong> {{ c.password }}</div>
          <div class="row"><strong>Data (exp):</strong> {{ formatDate(c.exp_date) }}</div>
          <div class="row"><strong>Teste:</strong> {{ c.is_trial ? 'Sim' : 'Não' }}</div>
          <div class="row"><strong>Notas:</strong> {{ c.reseller_notes || c.admin_notes || '-' }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const props = defineProps({ user: Object })

const clients = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const limit = ref(10)
const totalClients = ref(null)
const totalPages = ref(null)

// Simple local cache for clients to reduce backend calls
const CACHE_KEY = 'clientes_cache_v1'
// default TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw)
    return obj
  } catch (e) {
    console.warn('failed to load clients cache', e)
    return null
  }
}

function saveCache(payload) {
  try {
    const toSave = { ts: Date.now(), data: payload }
    localStorage.setItem(CACHE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('failed to save clients cache', e)
  }
}

const hideTrials = ref(false)

// filtered view of clients according to the toggle (hide trials when checked)
const filteredClients = computed(() => {
  if (!Array.isArray(clients.value)) return []
  if (hideTrials.value) return clients.value.filter(c => c && !c.is_trial)
  return clients.value
})

const expiringToday = computed(() => {
  if (!Array.isArray(filteredClients.value)) return []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = start + 24 * 60 * 60 * 1000 - 1
  return filteredClients.value.filter(c => {
    if (!c || !c.exp_date) return false
    const t = Number(c.exp_date) * 1000
    return t >= start && t <= end
  })
})

function sortByExpDesc(list) {
  if (!Array.isArray(list)) return []
  return list.slice().sort((a, b) => (b && b.exp_date ? b.exp_date : 0) - (a && a.exp_date ? a.exp_date : 0))
}

function formatDate(ts) {
  if (!ts) return '-'
  var d = new Date(ts * 1000)
  return d.toLocaleString()
}

async function fetchClients(opts = {}) {
  // opts: { page, limit, all }
  var usePage = opts.page || page.value || 1
  var useLimit = opts.limit || limit.value || 10
  var useAll = !!opts.all

  loading.value = true
  error.value = ''
  try {
    // if asking for all clients and not forcing, try cache first
    if (useAll && !opts.force) {
      const cached = loadCache()
      if (cached && cached.ts) {
        const age = Date.now() - cached.ts
        // if fresh, use cache and skip network
        if (age < CACHE_TTL) {
          clients.value = sortByExpDesc(cached.data.clients || [])
          totalClients.value = cached.data.totalClients != null ? cached.data.totalClients : (Array.isArray(cached.data.clients) ? cached.data.clients.length : null)
          totalPages.value = cached.data.totalPages != null ? cached.data.totalPages : null
          page.value = cached.data.page || usePage
          limit.value = cached.data.limit || useLimit
          loading.value = false
          return
        } else {
          // stale: show cached immediately while we refresh in background
          clients.value = sortByExpDesc(cached.data.clients || [])
          totalClients.value = cached.data.totalClients != null ? cached.data.totalClients : (Array.isArray(cached.data.clients) ? cached.data.clients.length : null)
          totalPages.value = cached.data.totalPages != null ? cached.data.totalPages : null
          page.value = cached.data.page || usePage
          limit.value = cached.data.limit || useLimit
          // continue to fetch and update cache
        }
      }
    }
  // Obter token/secret do localStorage (inseridos no login). Fallback para valores de exemplo.
  var token = localStorage.getItem('token') || 'token'
  var secret = localStorage.getItem('secret') || 'sua_chave_secreta'
  var payload = { token: token, secret: secret, page: usePage, limit: useLimit }
  if (useAll) payload.all = true

  const res = await fetch('/get_clientes_all', {
      // PocketBase routes for hooks are exposed under /api/pb/hooks or similar depending on setup.
      // Aqui chamamos a rota relativa /get_clientes_all no backend; se seu PB estiver em outra base, ajuste a URL.
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      var t = await res.text()
      console.log('fetch /get_clientes_all non-ok:', res.status, t)
      throw new Error(t || ('HTTP ' + res.status))
    }

    var data = await res.json()

    // o formato de sucesso esperado pelo usuário
    if (data && data.result === true && Array.isArray(data.data)) {
      clients.value = sortByExpDesc(data.data)
      // preencher metadados quando disponíveis
      totalClients.value = data.totalClients != null ? data.totalClients : (Array.isArray(data.data) ? data.data.length : null)
      totalPages.value = data.totalPages != null ? data.totalPages : null
      page.value = data.page || usePage
      limit.value = data.limit || useLimit
      // persistir no cache
      try {
        saveCache({ clients: data.data, totalClients: totalClients.value, totalPages: totalPages.value, page: page.value, limit: limit.value })
      } catch (e) { /* ignore */ }
    } else if (data && data.result === false) {
      throw new Error(data.mens || 'Erro desconhecido')
    } else {
      // se o backend devolver diretamente { statusCode, result, data }
      if (data && Array.isArray(data.data)) {
        clients.value = sortByExpDesc(data.data)
        totalClients.value = data.totalClients || (Array.isArray(data.data) ? data.data.length : null)
        totalPages.value = data.totalPages || null
        page.value = data.page || usePage
        limit.value = data.limit || useLimit
        // persistir no cache
        try {
          saveCache({ clients: data.data, totalClients: totalClients.value, totalPages: totalPages.value, page: page.value, limit: limit.value })
        } catch (e) { /* ignore */ }
      } else throw new Error('Resposta inesperada')
    }

  } catch (err) {
    error.value = String(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // carregar todos os clientes automaticamente
  fetchClients({ page: 1, limit: limit.value, all: true })
})
</script>

<style scoped>
.page { background: rgba(255,255,255,0.02); padding:1rem; border-radius:0.5rem }
.clients { margin-top: 1rem }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(13.75rem, 1fr)); gap: 0.75rem; margin-top: .5rem }
.card { background: rgba(255,255,255,0.03); padding: .75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.04) }
.row { margin-bottom: .4rem; font-size: .95rem }
.error { color: #f87171 }
.badge {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  background: #f59e0b;
  color: #111827;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}
.card { position: relative }

/* Make card borders more visible on light themes */
@media (prefers-color-scheme: light) {
  .card {
    border: 1px solid rgba(0,0,0,0.12);
    background: rgba(255,255,255,0.96);
  }
  .page { background: rgba(0,0,0,0.02); }
  .badge { color: #111827 }
}
</style>
