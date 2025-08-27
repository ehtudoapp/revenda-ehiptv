<template>
  <section class="page">
    <h3>Gerar Teste</h3>

    <label class="field">
      <span>Número de celular</span>
      <input v-model="phone" type="text" inputmode="numeric" placeholder="5511999998888" />
    </label>


    <div class="actions">
      <button @click="generateAndSend" :disabled="loading">{{ loading ? 'Gerando...' : 'Gerar teste' }}</button>
    </div>

    <p class="note" v-if="message">{{ message }}</p>

    <div v-if="result" class="result">
      <p><strong>Usuário:</strong> <code>{{ result.username }}</code> <button @click="copy(result.username)">Copiar</button></p>
      <p><strong>Senha:</strong> <code>{{ result.password }}</code> <button @click="copy(result.password)">Copiar</button></p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const phone = ref('')
const token = ref(localStorage.getItem('token') || '')
const secret = ref(localStorage.getItem('secret') || '')
const loading = ref(false)
const message = ref('')
const result = ref(null)

// letters to use (avoiding ambiguous characters)
const letters = 'ABCDEFGHKMNPQRSTUVWabcdefghkmnpqrstuvw'

function pickRandomLetters(n) {
  let out = ''
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * letters.length)
    out += letters[idx]
  }
  return out
}

function normalizeDigits(s) {
  return (s || '').replace(/\D+/g, '')
}

function generate() {
  message.value = ''
  const digits = normalizeDigits(phone.value)
  if (digits.length < 8) {
    message.value = 'Por favor insira pelo menos 8 dígitos do número de celular.'
    return
  }
  // take last 8 digits
  const last8 = digits.slice(-8)
  const part1 = last8.slice(0, 4)
  const part2 = last8.slice(4, 8)

  // for each group, add 3 random letters
  const letters1 = pickRandomLetters(3)
  const letters2 = pickRandomLetters(3)

  const password = letters1 + part1
  const username = letters2 + part2

  return { username, password }
}

async function generateAndSend() {
  // generate locally first
  const creds = generate()

  if (!creds) return

  if (!token.value || !secret.value) {
    message.value = 'Token e Secret são necessários para enviar ao servidor.'
    return
  }

  loading.value = true
  message.value = 'Enviando ao servidor...'

  try {
    const res = await fetch('/gerar-teste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, secret: secret.value, username: creds.username, password: creds.password })
    })

    let data
    try { data = await res.json() } catch (e) { data = null }

    if (!res.ok) {
      message.value = `Erro ${res.status}: ${data && data.error ? data.error : JSON.stringify(data)}`
      return
    }

    // API externa devolve result:true/false in body; repassamos isso ao usuário
    if (data && data.result === true) {
      const d = data.data || {}
      message.value = (d.mens) ? String(d.mens) : 'Usuário criado com sucesso.'
      // set result to returned credentials (or fallback to local creds)
      result.value = {
        username: d.username || creds.username,
        password: d.password || creds.password
      }
    } else {
      const errMsg = (data && (data.mens || data.error)) || JSON.stringify(data)
      message.value = 'Erro ao criar usuário: ' + String(errMsg)
      // do not set result on error
    }

  } catch (err) {
    message.value = 'Erro ao enviar: ' + String(err)
  } finally {
    loading.value = false
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    message.value = 'Copiado para a área de transferência.'
    setTimeout(() => (message.value = ''), 2000)
  } catch (e) {
    message.value = 'Não foi possível copiar automaticamente.'
  }
}
</script>

<style scoped>
.page { background: rgba(255,255,255,0.02); padding:1rem; border-radius:8px }
.field { display:flex; flex-direction:column; gap:.5rem; margin-bottom: .75rem }
.field input { padding:.6rem .75rem; border-radius:6px; border:1px solid rgba(0,0,0,0.12) }
.actions { display:flex; gap:.5rem; }
.actions button { background:var(--accent); color:white; border:none; padding:.5rem .85rem; border-radius:6px }
.note { color:#9ca3af; margin-top:.5rem }
.result { margin-top:1rem; background: rgba(255,255,255,0.02); padding: .75rem; border-radius:6px }
.result code { background: rgba(0,0,0,0.12); padding:.15rem .4rem; border-radius:4px }
.result button { margin-left:.5rem }
</style>
