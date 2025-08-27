// PocketBase route hook: POST /profile
// Recebe { token, secret } no body e encaminha para API externa: POST {EXTERNAL_API_BASE}/profile/{token} com body { secret }

routerAdd("POST", "/profile", (c) => {
  var externalApiBase = 'https://api.painelcliente.com';
  
  (async () => {
    try {
      var body;
      try {
        var bodyStr = readerToString(c.request.body);
        body = JSON.parse(bodyStr);
      } catch (err) {
        c.json(400, { error: 'Body inválido. Envie JSON.' });
        return;
      }

      var token = body && body.token;
      var secret = body && body.secret;

      if (!token) {
        c.json(400, { error: 'Campo `token` é obrigatório no body.' });
        return;
      }
      if (!secret) {
        c.json(400, { error: 'Campo `secret` é obrigatório no body.' });
        return;
      }

      var targetUrl = externalApiBase.replace(/\/$/, '') + '/profile/' + encodeURIComponent(token);

      // Encaminha a requisição para a API externa
      var resp;
      try {
        resp = $http.send({
          url: targetUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: { secret: secret }
        });
      } catch (err) {
        console.log('Erro ao chamar API externa:', String(err));
        c.json(502, { error: 'Falha ao conectar com API externa', details: String(err) });
        return;
      }

      // Parse da resposta
      var data;
      try {
        data = resp.json;
      } catch (err) {
        data = { text: resp.raw };
      }

      // Repasse do status e conteúdo da API externa
      var status = resp.statusCode || 200;
      c.json(status, data);

    } catch (err) {
      console.log('Erro no hook /profile ->', String(err));
      try { 
        c.json(500, { error: 'Erro interno do servidor', details: String(err) }); 
      } catch (e) {}
    }
  })().catch(function(err) {
    console.log('Erro nao tratado no hook /profile ->', String(err));
    try { 
      c.json(500, { error: 'Erro interno' }); 
    } catch (e) {}
  });
});
