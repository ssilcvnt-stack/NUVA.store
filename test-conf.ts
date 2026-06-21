console.log("COMPOSIO_URL is:", process.env.COMPOSIO_URL);
if (process.env.COMPOSIO_API_KEY) {
  console.log("COMPOSIO_API_KEY is defined, length:", process.env.COMPOSIO_API_KEY.length);
} else {
  console.log("COMPOSIO_API_KEY is not defined");
}
