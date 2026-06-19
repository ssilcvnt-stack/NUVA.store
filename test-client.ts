import { ComposioToolSet } from "composio-core";
const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
console.log(Object.keys(toolset.client));
console.log(Object.keys(toolset));
