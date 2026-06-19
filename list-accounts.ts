import { ComposioToolSet } from "composio-core";
async function list() {
  const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
  const accounts = await toolset.client.connectedAccounts.get({});
  console.log(JSON.stringify(accounts, null, 2));
}
list().catch(console.error);
