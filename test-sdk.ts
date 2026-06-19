import { ComposioToolSet } from "composio-core";
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
