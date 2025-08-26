// PocketBase route hook: POST /profile/{token}
// Recebe { "secret": SECRET } no body e faz proxy para
// https://api.painelcliente.com/profile/${TOKEN}

routerAdd("POST", "/profile/{token}", async (e) => {
  try {
    const token = e.request.pathValue("token")
    if (!token) {
      return e.json(400, { error: "Token ausente na URL" })
    }

    let body
    try {
      body = await e.request.json()
    } catch (err) {
      return e.json(400, { error: "Body inválido ou não é JSON" })
    }

    const secret = body && body.secret
    if (!secret) {
      return e.json(400, { error: "Secret ausente no body" })
    }

    const targetUrl = `https://api.painelcliente.com/profile/${encodeURIComponent(token)}`

    // Faz a chamada ao serviço externo
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret })
    })

    const contentType = (res.headers && res.headers.get && res.headers.get("content-type")) || ''
    let data
    if (contentType.includes("application/json")) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    // Retorna o conteúdo do serviço externo. Se o serviço externo falhar, repassamos o status.
    const status = res.status || (res.ok ? 200 : 502)
    // Normalizamos a resposta JSON para consistência com o PocketBase hook
    console.log("Proxy response status:", status, "Content-Type:", contentType)
    return e.json(status, { proxiedStatus: res.status, data })
  } catch (err) {
    return e.json(500, { error: "Erro interno no proxy", details: String(err) })
  }
})
