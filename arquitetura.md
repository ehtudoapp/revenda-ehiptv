# Arquitetura do Projeto

Este documento descreve a arquitetura do projeto `revenda-ehiptv`, cobrindo ambos os ambientes: backend e frontend. Ele oferece uma visão de alto nível, componentes principais, fluxos de dados, comandos de desenvolvimento e recomendações para deploy, segurança e observabilidade.

## Sumário

- Visão geral
- Estrutura do repositório
- Backend
  - Tecnologias
  - Componentes
  - Armazenamento de dados
  - Execução local e em produção
- Frontend
  - Tecnologias
  - Componentes principais
  - Build e execução
- Integração entre frontend e backend
- Deploy e ambientes
- Segurança e boas práticas
- Observabilidade e troubleshooting
- Próximos passos

## Visão geral

O projeto é uma aplicação web dividida em duas partes principais:

- Backend: serviço baseado em PocketBase (SQLite embutido) que fornece API, autenticação, hooks personalizados e armazenamento de dados.
- Frontend: aplicação SPA construída com Vite + Vue (arquivos `src/`, `App.vue`, `main.js`) que consome a API do backend e fornece a interface do usuário.

A arquitetura favorece uma separação clara entre UI e API, com o PocketBase servindo como BaaS leve para autenticação, coleções e arquivos estáticos.

## Estrutura do repositório

Raiz:

- `backend/` — código e artefatos do backend (PocketBase, hooks, migrations, dados persistentes).
  - `Dockerfile` — imagem para containerização do backend.
  - `pb_data/` — banco SQLite e arquivos relacionados (`data.db`, `auxiliary.db*`).
  - `pb_hooks/` — hooks escritos em JS que interceptam eventos da API.
  - `pb_public/` — conteúdo público (ex.: `index.html`, `assets/`).
  - `pb_migrations/` - conteudo relacionado a atualizações do banco de dados

- `frontend/` — aplicação web construída com Vite + Vue.
  - `index.html`, `package.json`, `vite.config.js`
  - `src/` — código fonte do Vue (`App.vue`, `main.js`, `pages/`, `components/`).

## Backend

Tecnologias
- PocketBase (binário + Dockerfile)
- SQLite (arquivo único dentro de `pb_data/`)
- Hooks JS em `pb_hooks/` para lógica customizada

Componentes
- API REST/Realtime fornecida pelo PocketBase
- Coleções/records gerenciadas pelo PocketBase (modelagem via console / migrations)
- Hooks para: validação, enriquecimento de dados, integrações externas
- `pb_public/` para arquivos públicos servidos pelo PocketBase (opcional)

Armazenamento de dados
- Dados persistidos em SQLite (`pb_data/data.db`)
- Arquivos e uploads também gerenciados pelo PocketBase no diretório de dados

Execução local
- Execução direta: rodar `pocketbase.exe serve` dentro de `backend/` (Windows)
- Execução em container: construir a imagem com `Dockerfile` e rodar em container (expor portas conforme a configuração do Dockerfile)

Considerações de produção
- Use volume persistente para `pb_data/` no container
- Faça backups regulares do arquivo SQLite
- Se precisar de escalabilidade horizontal, considerar migração para backend mais robusto ou arquitetura com sincronização/replicação

## Frontend

Tecnologias
- Vite (bundler/ dev server)
- Vue.js (componentes em `src/`)

Componentes principais
- `src/main.js` — ponto de entrada
- `src/App.vue` — layout principal
- `src/pages/` — páginas (Home, Login, GerarTeste)
- `src/components/Sidebar.vue` — componente compartilhado

Build e execução
- Instalar dependências: `npm install` dentro de `frontend/`
- Desenvolvimento local: `npm run dev` (Vite dev server)
- Produção: `npm run build` gera `dist/` (conteúdo estático) que pode ser servido via CDN, Nginx, ou `pb_public/` do PocketBase se optar por hospedar tudo em um único host.

Configurações úteis
- `vite.config.js` pode ser ajustado para definir proxy de API durante desenvolvimento (ex.: encaminhar `/api` para `http://localhost:8090`)

## Integração entre Frontend e Backend

Comunicação
- O frontend consome a API REST/Realtime exposta pelo PocketBase.
- Autenticação via endpoints do PocketBase (login, registro, tokens de sessão).
- Uploads e downloads de arquivos gerenciados pelo PocketBase.

CORS e Proxy
- Em desenvolvimento, prefira configurar proxy no Vite para evitar problemas de CORS.
- Em produção, sirva frontend e backend sob o mesmo domínio ou configure CORS no gateway reverso.

## Deploy e ambientes

Ambientes sugeridos
- Desenvolvimento: executando `pocketbase.exe` + `npm run dev` no frontend (ou docker-compose com ambos os serviços)
- Homologação/QA: containerizar backend e servir frontend via CDN ou Nginx
- Produção: container Docker para backend (com volume para dados). Frontend servido como artefatos estáticos em CDN ou integrado ao `pb_public/`.

Exemplo simples com Docker Compose (recomendação)
- Backend: container PocketBase com volume `./backend/pb_data:/pb_data` e porta exposta (ex.: 8090)
- Frontend: build estático servido por Nginx ou CDN

## Segurança e boas práticas

- Não versionar arquivos de dados (ex.: `pb_data/data.db`) — idealmente adicionar a .gitignore. Atualmente o repositório contém `pb_data/` com arquivos; considerar removê-los do controle de versão e migrar para backups externos.
- Proteger endpoints administrativos do PocketBase com autenticação forte.
- Usar HTTPS em produção (terminação TLS em proxy reverso / CDN).
- Evitar armazenar secrets em arquivos de configuração no repositório; usar variáveis de ambiente ou secret manager.
- Limitar tamanho de uploads e validar tipos de arquivo nos hooks.

## Observabilidade e troubleshooting

- Logs: capturar stdout/stderr do PocketBase (rotacionar logs se necessário).
- Backups: agendar cópia do `data.db` para armazenamento seguro.
- Monitoramento leve: healthcheck de container, tempo de resposta de endpoints críticos.
- Em caso de corrupção do SQLite, restaurar a partir de backup.

## Testes

- Frontend: criar testes unitários e E2E (ex.: Vitest + Playwright / Cypress) conforme necessidade.
- Backend (PocketBase hooks): testar logicamente os hooks com testes unitários simulando payloads e usando uma instância de PocketBase para testes de integração.

## Próximos passos e recomendações

- Revisar controle de versão do diretório `backend/pb_data/` e remover arquivos binários/dados do histórico (usar .gitignore e, se preciso, git-filter-repo ou BFG para limpar o histórico).
- Adicionar um `docker-compose.yml` para orquestrar frontend (opcional), backend e serviços auxiliares.
- Documentar scripts de inicialização no `README.md` com comandos rápidos para desenvolvedores:

  - Backend (local): `cd backend; ./pocketbase serve` (ou `pocketbase.exe serve` no Windows)
  - Frontend (dev): `cd frontend; npm install; npm run dev`
  - Frontend (build): `cd frontend; npm run build`

- Implementar CI simples que execute lint/build do frontend e verifique hooks do backend.

---

Arquivo gerado automaticamente: `arquitetura.md`
