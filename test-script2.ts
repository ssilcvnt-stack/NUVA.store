async function testRPC() {
  try {
    const composioUrl = process.env.COMPOSIO_URL;
    const composioKey = process.env.COMPOSIO_API_KEY;

    if (!composioUrl) {
       console.log("Add COMPOSIO_URL to your local env to test manually OR running through dev container env limits.");
    }
    
    // We fetch our server which knows the env
    const res = await fetch('http://127.0.0.1:3000/api/test-email', {
      method: 'POST'
    });
    console.log("Response:", await res.text());
  } catch (e) {
    console.error("Fetch error:", e);
  }
}
testRPC();
