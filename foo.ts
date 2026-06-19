async function check() {
  const res = await fetch("http://127.0.0.1:3000/api/test-email", {method:"POST"});
  // we do not need to check url this way if we can just make server return the url.
}
