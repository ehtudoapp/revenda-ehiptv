// PocketBase route hook: POST /gerar-teste
// Encaminha a criação de trial para API externa: {URL}/trial_create/{TOKEN}

routerAdd("POST", "/gerar-teste", (c) => {
  // alterar externalApiBase conforme necessário
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
      var username = body && body.username;
      var password = body && body.password;

      if (!token) {
        c.json(400, { error: 'Campo `token` é obrigatório no body.' });
        return;
      }
      if (!secret) {
        c.json(400, { error: 'Campo `secret` é obrigatório no body.' });
        return;
      }
      if (!username) {
        c.json(400, { error: 'Campo `username` é obrigatório no body.' });
        return;
      }
      if (!password) {
        c.json(400, { error: 'Campo `password` é obrigatório no body.' });
        return;
      }

      var targetUrl = externalApiBase.replace(/\/$/, '') + '/trial_create/' + encodeURIComponent(token);

      var postBody = {
        secret: secret,
        username: username,
        password: password,
        idbouquet: [16],
        notes: 'Teste criado pelo painel revenda Eh!IPTV'
      };

      var resp;
      try {
        resp = $http.send({
          url: targetUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: postBody
        });
      } catch (err) {
        console.log('Erro ao chamar API externa /trial_create:', String(err));
        c.json(502, { error: 'Falha ao conectar com API externa', details: String(err) });
        return;
      }

      var data;
      try {
        data = resp.json;
      } catch (err) {
        data = { text: resp.raw };
      }

      var status = resp.statusCode || 200;
      c.json(status, data);

    } catch (err) {
      console.log('Erro no hook /gerar-teste ->', String(err));
      try {
        c.json(500, { error: 'Erro interno do servidor', details: String(err) });
      } catch (e) {}
    }
  })().catch(function(err) {
    console.log('Erro nao tratado no hook /gerar-teste ->', String(err));
    try {
      c.json(500, { error: 'Erro interno' });
    } catch (e) {}
  });
});
