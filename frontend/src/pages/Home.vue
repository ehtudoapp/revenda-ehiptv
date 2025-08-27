<template>
  <section class="page">
    <h3>Resumo</h3>
    <p>Usuário: <strong>{{ user.username }}</strong></p>
    <p>Créditos disponíveis: <strong>{{ user.credits }}</strong></p>
  </section>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ user: Object })
</script>

<style scoped>
.page { background: rgba(255,255,255,0.02); padding:1rem; border-radius:8px }
</style>
