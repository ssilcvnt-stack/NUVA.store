async function testSendOrder() {
  const sampleOrder = {
    id: "NV-TEST-123",
    items: [
      {
        quantity: 1,
        product: {
          name: "CAMISETA ESSENCIAL TESTE",
          price: 15990
        },
        selectedColor: {
          name: "Branco Puro (White)",
          priceOverride: 15990
        },
        selectedSize: "M"
      }
    ],
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "ssilcvnt@gmail.com",
      phone: "912345678",
      address: "Rua de Teste, 123",
      city: "Luanda",
      country: "Angola",
      paymentMethod: "vanqir_mcx"
    },
    subtotal: 15990,
    shipping: 0,
    tax: 1964,
    total: 15990,
    createdAt: new Date().toLocaleDateString("pt-PT")
  };

  try {
    const res = await fetch("http://localhost:3000/api/send-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sampleOrder)
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Body:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error fetching local server:", e);
  }
}
testSendOrder();
