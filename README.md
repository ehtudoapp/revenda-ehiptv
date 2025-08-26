# Projeto Revenda EH IPTV

Este projeto foi zerado e está pronto para um novo início. A estrutura básica foi mantida para facilitar o desenvolvimento.

## Estrutura do Projeto

```
/
├── backend/
│   └── pocketbase.exe          # Executável do PocketBase
├── frontend/
│   ├── index.html              # HTML principal
│   ├── package.json            # Dependências do projeto
│   ├── vite.config.js          # Configuração do Vite
│   └── src/                    # Código fonte
│       ├── App.vue             # Componente principal
│       ├── main.js             # Ponto de entrada
│       ├── style.css           # Estilos globais
│       ├── assets/             # Imagens e outros recursos
│       └── components/         # Componentes Vue
```

## Iniciando o Desenvolvimento

### Backend (PocketBase)

1. Entre na pasta `backend`:
   ```
   cd backend
   ```

2. Inicie o PocketBase:
   ```
   .\pocketbase.exe serve --dev
   ```

3. Acesse o dashboard em `http://127.0.0.1:8090/_/`

### Frontend (Vue + Vite)

1. Entre na pasta `frontend`:
   ```
   cd frontend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

4. Para construir para produção:
   ```
   npm run build
   ```

## Configuração para Produção

O `vite.config.js` está configurado para construir os arquivos na pasta `../backend/pb_public`, que é onde o PocketBase serve os arquivos estáticos. Isso permite que o frontend seja servido diretamente pelo PocketBase.

```javascript
// vite.config.js
export default defineConfig({
  // ...
  build: {
    outDir: '../backend/pb_public',
    emptyOutDir: true
  }
});
```

Após o build, basta iniciar o PocketBase e acessar `http://127.0.0.1:8090/` para ver a aplicação.
