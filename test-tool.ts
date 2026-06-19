import { ComposioToolSet } from "composio-core";
const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
toolset.client.actions.get("GMAIL_SEND_EMAIL").then(console.log).catch(console.error);
