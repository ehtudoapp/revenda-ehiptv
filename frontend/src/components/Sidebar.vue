<template>
  <aside class="sidebar">
    <div class="brand">Painel</div>
    <nav>
      <a href="#" :class="{active: route==='home'}" @click.prevent="$emit('navigate','home')">Início</a>
      <a href="#" :class="{active: route==='gerar-teste'}" @click.prevent="$emit('navigate','gerar-teste')">Gerar-teste</a>
      <a href="#" @click.prevent="$emit('logout')" class="logout">Sair</a>
    </nav>
  </aside>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'
const props = defineProps({ route: String })
</script>

<style scoped>
.sidebar { width:220px; background:#0f1724; color:white; padding:1rem }
.sidebar .brand { font-weight:700; margin-bottom:1rem }
.sidebar nav a { display:block; padding:.5rem .25rem; color:inherit; text-decoration:none; border-radius:4px }
.sidebar nav a.active, .sidebar nav a:hover { background: rgba(255,255,255,0.06) }
.sidebar .logout { margin-top:1rem; color:#fca5a5 }
</style>
