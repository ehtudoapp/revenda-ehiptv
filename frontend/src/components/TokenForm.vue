<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="card">
      <h2>Painel Cliente</h2>
      <input v-model="token" type="text" placeholder="TOKEN" required />
      <input v-model="secret" type="text" placeholder="SECRET" required />
      <button type="submit" :disabled="loading">{{ loading ? 'Enviando...' : 'Enviar' }}</button>
      <div v-if="response" class="response">{{ response }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const token = ref('')
const secret = ref('')
const response = ref('')
const error = ref('')
const loading = ref(false)

async function submitForm() {
  response.value = ''
  error.value = ''
  if (!token.value || !secret.value) {
    error.value = 'TOKEN e SECRET são obrigatórios.'
    return
  }
  loading.value = true
  try {
    const res = await fetch(`https://127.0.0.1:8090/profile/${encodeURIComponent(token.value)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secret.value })
    })
    const contentType = res.headers.get('content-type') || ''
    let data
    if (contentType.includes('application/json')) data = await res.json()
    else data = await res.text()

    if (!res.ok) {
      error.value = typeof data === 'string' ? data : JSON.stringify(data)
    } else {
      response.value = typeof data === 'string' ? data : JSON.stringify(data)
    }
  } catch (e) {
    error.value = 'Erro ao enviar requisição.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6fa;
}
.card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(20,20,30,0.06);
  border: 1px solid #eef0f3;
}
input {
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #dfe6ef;
  border-radius: 6px;
}
button {
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  border: none;
  background: #4f46e5;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}
button:disabled { opacity: 0.7; cursor: default }
.response { color: #08660d; font-size: 0.9rem; word-break: break-word }
.error { color: #9b1c1c; font-size: 0.9rem; word-break: break-word }
</style>
