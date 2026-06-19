import crypto from "crypto";

async function testUpload() {
  const composioKey = process.env.COMPOSIO_API_KEY;
  const content = Buffer.from("test text");
  const mimeType = "text/plain";
  
  const body = {
    action: "GMAIL_SEND_EMAIL",
    app: "gmail",
    filename: `test_${Date.now()}.txt`,
    mimetype: mimeType,
    md5: crypto.createHash("md5").update(content).digest("hex")
  };

  const res = await fetch("https://backend.composio.dev/api/v3/actions/files/upload/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": composioKey!
    },
    body: JSON.stringify(body)
  });

  const resText = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", resText);
}
testUpload();
