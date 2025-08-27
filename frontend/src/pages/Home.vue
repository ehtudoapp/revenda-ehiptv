<template>
  <section class="page">
    <h3>Resumo</h3>
    <p>Usuário: <strong>{{ user.username }}</strong></p>
    <p>Créditos disponíveis: <strong>{{ user.credits }}</strong></p>

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
      <h4>Clientes</h4>
      <div class="controls">
        <span v-if="totalClients !== null" class="meta">Total: {{ totalClients }} </span>
      </div>
      <div v-if="loading">Carregando clientes...</div>
      <div v-else-if="error" class="error">Erro: {{ error }}</div>
      <div v-else class="cards">
        <div v-if="clients.length===0">Nenhum cliente encontrado.</div>
        <div v-for="c in clients" :key="c.id" class="card">
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

const expiringToday = computed(() => {
  if (!Array.isArray(clients.value)) return []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = start + 24 * 60 * 60 * 1000 - 1
  return clients.value.filter(c => {
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
.page { background: rgba(255,255,255,0.02); padding:1rem; border-radius:8px }
.clients { margin-top: 1rem }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-top: .5rem }
.card { background: rgba(255,255,255,0.03); padding: .75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04) }
.row { margin-bottom: .4rem; font-size: .95rem }
.error { color: #f87171 }
.badge {
  position: absolute;
  right: 8px;
  top: 8px;
  background: #f59e0b;
  color: #111827;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.card { position: relative }
</style>
