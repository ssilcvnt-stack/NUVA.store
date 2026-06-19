import { ComposioToolSet } from "composio-core";
process.env.COMPOSIO_LOGGING_LEVEL = "debug";
async function test() {
  const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
  try {
     const result = await toolset.executeAction({
          action: "GMAIL_SEND_EMAIL",
          entityId: "default",
          params: {
              to: "nuva2026@proton.me",
              subject: "Teste",
              body: "Teste"
          }
      });
      console.log("Win:", result);
  } catch (e) {
      console.error(e);
  }
}
test();
