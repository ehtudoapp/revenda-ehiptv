// PocketBase route hook: POST /api/proxy
// Exemplo de proxy para API externa

routerAdd("POST", "/api/proxy", (c) => {
  // Usamos uma função normal (não async) e um IIFE para evitar o Warning do PocketBase
  ;(async () => {
    try {
      // 1. Ler o body como JSON
      let body;
      try {
        body = await c.request.json();
      } catch (err) {
        console.log("Erro ao ler body:", String(err));
        c.json(400, { error: "Body inválido. Envie JSON com os parâmetros necessários." });
        return;
      }

      // 2. Exemplo de resposta (substitua por sua lógica)
      c.json(200, {
        success: true,
        message: "API funcionando!",
        receivedData: body
      });
    } catch (err) {
      console.log("Erro interno:", String(err));
      c.json(500, { 
        error: "Erro interno", 
        details: String(err)
      });
    }
  })().catch(err => {
    console.log("Erro não tratado:", String(err));
    try {
      c.json(500, { error: "Erro interno" });
    } catch (e) { /* ignore */ }
  });
})
