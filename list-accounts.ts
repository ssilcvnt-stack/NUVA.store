import { ComposioToolSet } from "composio-core";

async function listConnections() {
  const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
  const accounts = await toolset.client.connectedAccounts.list({});
  console.log(JSON.stringify(accounts, null, 2));
}
listConnections();
