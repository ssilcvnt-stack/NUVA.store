import { ComposioToolSet } from "composio-core";
async function test() {
  const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
  console.log(await toolset.client.backendClient.actionsV2.createFileUploadUrl({
        client: toolset.client.backendClient,
        body: {
            action: "GMAIL_SEND_EMAIL",
            app: "gmail",
            filename: `test.txt`,
            mimetype: "text/plain",
            md5: "d41d8cd98f00b204e9800998ecf8427e"
        },
        path: {
            fileType: "request",
        },
    }));
}
test().catch(e => console.error(e));
