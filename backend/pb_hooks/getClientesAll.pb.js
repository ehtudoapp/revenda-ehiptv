// PocketBase route hook: POST /get_clientes_all
// Recebe { token, secret, page, limit } no body e encaminha para API externa: POST {EXTERNAL_API_BASE}/{TOKEN}
// Com body { secret, page, limit }

routerAdd("POST", "/get_clientes_all", (c) => {
  var externalApiBase = 'https://api.painelcliente.com';

  // When developing or when external API fails we'll return a mocked response
  var useMock = false; // mock disabled: encaminhar para API externa

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
      var page = body && body.page || 1;
      var limit = body && body.limit || 10;

      if (!token) {
        c.json(400, { error: 'Campo `token` é obrigatório no body.' });
        return;
      }
      if (!secret) {
        c.json(400, { error: 'Campo `secret` é obrigatório no body.' });
        return;
      }

      var targetUrl = externalApiBase.replace(/\/$/, '') + '/get_clients_all/' + encodeURIComponent(token);

      if (useMock) {
        // Mocked success response (conforme especificado pelo usuário)
        var mockData = {
          statusCode: 200,
          result: true,
          data: [
            {
              id: 123,
              member_id: 52655,
              username: 'cliente1',
              password: 'senha123',
              exp_date: 1727232150,
              admin_enabled: 1,
              enabled: 1,
              admin_notes: 'nota de server',
              reseller_notes: 'nota da revenda',
              bouquet: 14,
              max_connections: 2,
              is_trial: 0,
              created_at: 1677292950
            },
            {
              id: 124,
              member_id: 52655,
              username: 'cliente2',
              password: 'senha1234',
              exp_date: 1727232150,
              admin_enabled: 1,
              enabled: 1,
              admin_notes: 'nota de server',
              reseller_notes: 'nota da revenda',
              bouquet: 14,
              max_connections: 2,
              is_trial: 0,
              created_at: 1677292958
            }
          ],
          totalClients: 31,
          totalPages: 4
        };

        c.json(200, mockData);
        return;
      }

      // Encaminha a requisição para a API externa
      var aggregateAll = body && body.all === true;

      var resp;
      try {
        resp = $http.send({
          url: targetUrl,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { secret: secret, page: page, limit: limit }
        });
      } catch (err) {
        console.log('Erro ao chamar API externa:', String(err));
        c.json(502, { statusCode: 502, result: false, mens: 'Falha ao conectar com API externa', details: String(err) });
        return;
      }

      // Parse da resposta inicial
      var remote;
      try {
        remote = resp.json;
      } catch (err) {
        remote = { text: resp.raw };
      }

      // Se o remote indicar erro, repasse
      if (remote && remote.result === false) {
        c.json(resp.statusCode || 200, remote);
        return;
      }

      // Normaliza campos
      var combinedData = Array.isArray(remote.data) ? remote.data.slice() : [];
      var totalClients = remote.totalClients || (Array.isArray(remote.data) ? remote.data.length : 0);
      var totalPages = remote.totalPages || (limit > 0 ? Math.ceil(totalClients / limit) : 1);

      // Se solicitado, agregue todas as páginas (faz múltiplas chamadas ao endpoint externo)
      if (aggregateAll) {
        try {
          // Se totalPages não estiver presente, tentaremos buscar até que uma página retorne menos itens que `limit`.
          if (!remote.totalPages) {
            var currentPage = page;
            while (true) {
              currentPage++;
              var r = $http.send({
                url: targetUrl,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: { secret: secret, page: currentPage, limit: limit }
              });
              var jr;
              try { jr = r.json; } catch (e) { jr = { text: r.raw }; }
              if (jr && Array.isArray(jr.data) && jr.data.length > 0) {
                combinedData = combinedData.concat(jr.data);
                // se retornou menos que o limit, presumimos fim
                if (jr.data.length < limit) break;
                // continue looping
              } else {
                break;
              }
            }
            totalClients = combinedData.length;
            totalPages = limit > 0 ? Math.ceil(totalClients / limit) : 1;
          } else {
            // sabemos totalPages: buscar páginas restantes
            for (var p = page + 1; p <= totalPages; p++) {
              try {
                var r2 = $http.send({
                  url: targetUrl,
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  data: { secret: secret, page: p, limit: limit }
                });
                var jr2;
                try { jr2 = r2.json; } catch (e) { jr2 = { text: r2.raw }; }
                if (jr2 && Array.isArray(jr2.data) && jr2.data.length > 0) {
                  combinedData = combinedData.concat(jr2.data);
                }
              } catch (e) {
                console.log('Erro ao agregar página', p, String(e));
                break;
              }
            }
            totalClients = remote.totalClients || combinedData.length;
          }
        } catch (e) {
          console.log('Erro ao agregar todos os clientes:', String(e));
        }
      }

      var out = {
        statusCode: 200,
        result: true,
        data: combinedData,
        totalClients: totalClients,
        totalPages: totalPages,
        page: page,
        limit: limit
      };

      c.json(200, out);

    } catch (err) {
      console.log('Erro no hook /get_clientes_all ->', String(err));
      try {
        c.json(500, { error: 'Erro interno do servidor', details: String(err) });
      } catch (e) {}
    }
  })().catch(function(err) {
    console.log('Erro nao tratado no hook /get_clientes_all ->', String(err));
    try { c.json(500, { error: 'Erro interno' }); } catch (e) {}
  });
});
