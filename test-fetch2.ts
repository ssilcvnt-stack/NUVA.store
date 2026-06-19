async function manualFetch() {
  const composioKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch("https://api.composio.dev/api/v1/actions/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": composioKey
    },
    body: JSON.stringify({
      action: "GMAIL_SEND_EMAIL",
      text: "Enviar um email para nuva2026@proton.me, ssilcvnt@gmail.com, augustocostamrkt@outlook.pt com o assunto 'Teste' e corpo 'Teste de email através da API REST'",
      entityId: "default"
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
manualFetch();
