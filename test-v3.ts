async function manualFetch() {
  const composioKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch("https://backend.composio.dev/api/v2/actions/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": composioKey
    },
    body: JSON.stringify({
      action: "GMAIL_SEND_EMAIL",
      text: "Enviar um email para nuva2026@proton.me com o assunto 'Teste' e corpo 'Teste de email através da API REST'",
      entityId: "default"
    })
  });
  console.log("Status v2:", res.status);
  console.log("Body v2:", await res.text());

  const res3 = await fetch("https://backend.composio.dev/api/v3/actions/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": composioKey
    },
    body: JSON.stringify({
      appName: "gmail",
      actionId: "GMAIL_SEND_EMAIL",
      text: "Enviar um email para nuva2026@proton.me com o assunto 'Teste'",
      entityId: "default"
    })
  });
  console.log("Status v3:", res3.status);
  console.log("Body v3:", await res3.text());
}
manualFetch();
