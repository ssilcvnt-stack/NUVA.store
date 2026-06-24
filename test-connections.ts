async function listConnections() {
  const composioKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch("https://backend.composio.dev/api/v1/connections", {
    method: "GET",
    headers: {
      "x-api-key": composioKey!
    }
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Connections:", JSON.stringify(data, null, 2));
}
listConnections();
