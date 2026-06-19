import { ComposioToolSet } from "composio-core";
async function test() {
  const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
  try {
     const result = await toolset.executeAction({
          action: "GMAIL_SEND_EMAIL",
          entityId: "default",
          params: {
              to: "ssilcvnt@gmail.com",
              subject: "Teste 2",
              body: "Isto é um teste"
          }
      });
      console.log("Success:", JSON.stringify(result, null, 2));
  } catch (e) {
      console.error(e);
  }
}
test();
