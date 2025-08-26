# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Instruções rápidas (pt-BR)

Rodando o frontend (Vite):

1. abra um terminal em `frontend`
2. instale dependências

```
npm install
```

3. rode o dev server

```
npm run dev
```

Rodando com o PocketBase embed (proxy local):

1. construa/execute o servidor embed em `backend/embed` (requer Go para compilar) ou use o binário preparado em `backend/`:

```
# a partir de backend/embed
go build -o ../pocketbase_embed.exe
# então execute
..\pocketbase_embed.exe
```

2. rode o frontend como acima. O formulário do app postará para `/profile/{TOKEN}`, que será servido pelo PocketBase embed, evitando problemas de CORS e mantendo o `secret` processado no servidor.

Segurança: mantenha o PocketBase e o proxy em HTTPS em produção e não exponha dados sensíveis diretamente no cliente.
