<template>
  <form class="auth-card" @submit.prevent="onSubmit">
    <h2>Entrar</h2>

    <label class="field">
      <span>Token</span>
      <input v-model="token" type="text" placeholder="Cole o token" required />
    </label>

    <label class="field">
      <span>Secret</span>
      <input v-model="secret" type="password" placeholder="Cole o secret" required />
    </label>

    <div class="actions">
      <button type="submit" :disabled="loading">{{ loading ? 'Enviando...' : 'Entrar' }}</button>
    </div>

    <p class="note" v-if="message">{{ message }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['success'])

const token = ref(localStorage.getItem('token') || '')
const secret = ref(localStorage.getItem('secret') || '')
const message = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!token.value || !secret.value) {
    message.value = 'Preencha token e secret.'
    return
  }

  loading.value = true
  message.value = 'Enviando...'

  try {
    const res = await fetch(`/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, secret: secret.value })
    })

    let data
    try { data = await res.json() } catch (e) { data = null }

    if (!res.ok) {
      message.value = `Erro ${res.status}: ${data && data.mens ? data.mens : (data && data.error) || JSON.stringify(data)}`
      return
    }

    const payload = data || {}
    if (payload.result === true) {
      const d = payload.data || {}
      const user = {
        username: d.username || '—',
        credits: d.credits != null ? d.credits : 0,
        raw: d
      }
      localStorage.setItem('token', token.value)
      localStorage.setItem('secret', secret.value)
      emit('success', { token: token.value, secret: secret.value, user })
    } else {
      const errMsg = payload.mens || (payload.data && payload.data.mens) || JSON.stringify(payload)
      message.value = errMsg || 'Falha ao autenticar.'
    }

  } catch (err) {
    message.value = 'Erro ao enviar: ' + String(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card { width:100%; max-width:26.25rem; margin:4rem auto; background:var(--card-bg); border:1px solid var(--card-border); border-radius:0.625rem; padding:2rem; box-shadow:0 0.375rem 1.25rem rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:1rem }
.field { display:flex; flex-direction:column; gap:0.5rem }
.field input { padding:0.6rem 0.75rem; border-radius:0.375rem; border:1px solid rgba(0,0,0,0.12) }
.actions { display:flex; justify-content:center }
.actions button { background:var(--accent); color:white; border:none; padding:0.6rem 1.1rem; border-radius:0.375rem }
.note { text-align:center; font-size:0.9rem; color:#9ca3af }
</style>
