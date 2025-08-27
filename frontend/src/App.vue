<template>
  <div class="app-root">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

    const ct = res.headers && res.headers.get ? (res.headers.get('content-type') || '') : ''
    let data
    try {
      if (ct.includes('application/json')) data = await res.json()
      else data = await res.text()
    } catch (err) {
      data = await res.text().catch(() => String(err))
    }

    if (!res.ok) {
      message.value = `Erro ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    } else {
      // Sucesso: salva localmente e mostra feedback
      localStorage.setItem('token', token.value)
      localStorage.setItem('secret', secret.value)
      message.value = 'Enviado com sucesso.'
    }
  } catch (err) {
    message.value = 'Erro ao enviar: ' + String(err)
  } finally {
    loading.value = false
  }
}
</script>

<style>
:root {
  --card-bg: rgba(255,255,255,0.04);
  --card-border: rgba(255,255,255,0.06);
  --accent: #3b82f6;
}

.app-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: inherit;
}

.auth-card h2 {
  margin: 0 0 .25rem 0;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.field span {
  font-size: .9rem;
  opacity: .9;
}

.field input {
  padding: .6rem .75rem;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.12);
  outline: none;
  background: rgba(255,255,255,0.02);
  color: inherit;
}

.actions {
  display: flex;
  justify-content: center;
}

.actions button {
  background: var(--accent);
  color: white;
  border: none;
  padding: .6rem 1.1rem;
  border-radius: 6px;
  cursor: pointer;
}

.note {
  text-align: center;
  font-size: .9rem;
  color: #9ca3af;
  margin-top: .5rem;
}

@media (prefers-color-scheme: light) {
  :root {
    --card-bg: #fff;
    --card-border: #e6e9ee;
    --accent: #2563eb;
  }
  .auth-card { color: #111 }
}
</style>
