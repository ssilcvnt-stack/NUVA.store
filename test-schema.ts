import { ComposioToolSet } from "composio-core";
async function test() {
  const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
  try {
     const schema = await toolset.client.actions.get("GMAIL_SEND_EMAIL");
     console.log(JSON.stringify(schema, null, 2));
  } catch(e) { }
}
test();
