<template>
  <!-- overlay is a real element so clicks are reliably captured to close the drawer -->
  <div v-if="open" class="overlay" @click="$emit('close')"></div>
  <aside :class="['sidebar', { 'open': open }]">
    <div class="drawer">
      <div class="brand">Painel</div>
      <nav>
        <a href="#" :class="{active: route==='home'}" @click.prevent="$emit('navigate','home'); $emit('close')">Início</a>
        <a href="#" :class="{active: route==='gerar-teste'}" @click.prevent="$emit('navigate','gerar-teste'); $emit('close')">Gerar teste</a>
        <a href="#" @click.prevent="$emit('logout')" class="logout">Sair</a>
      </nav>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({ route: String, open: { type: Boolean, default: false } })
</script>

<style scoped>
.sidebar { width:220px; background:#0f1724; color:white; padding:1rem }
.sidebar .brand { font-weight:700; margin-bottom:1rem }
.sidebar nav a { display:block; padding:.5rem .25rem; color:inherit; text-decoration:none; border-radius:4px }
.sidebar nav a.active, .sidebar nav a:hover { background: rgba(255,255,255,0.06) }
.sidebar .logout { margin-top:1rem; color:#fca5a5 }

/* mobile: turn into right-side drawer */
@media (max-width: 768px) {
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); opacity: 0; transition: opacity .2s ease; z-index: 1000 }
  .overlay { opacity: 1 }

  .sidebar { position: fixed; top: 0; right: 0; height: 100vh; width: 260px; transform: translateX(100%); transition: transform .25s ease; padding:0; z-index: 1001 }
  .sidebar.open { transform: translateX(0); }
  .sidebar .drawer { padding:1rem; height:100%; background:#0f1724; position: relative; z-index: 1002 }
}
</style>
