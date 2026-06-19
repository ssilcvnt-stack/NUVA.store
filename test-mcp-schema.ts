async function testRPC() {
  try {
    const composioUrl = process.env.COMPOSIO_URL;
    const composioKey = process.env.COMPOSIO_API_KEY;

    const body = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "COMPOSIO_GET_TOOL_SCHEMAS",
        arguments: {
           tool_slugs: ["GMAIL_SEND_EMAIL"]
        }
      },
      id: 1
    };

    const res = await fetch(composioUrl!, {
      method: 'POST',
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "Authorization": `Bearer ${composioKey!}`,
          "x-api-key": composioKey!
      },
      body: JSON.stringify(body)
    });
    console.log("Response:", await res.text());
  } catch (e) {
    console.error("Fetch error:", e);
  }
}
testRPC();
