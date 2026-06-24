async function runTestOrder() {
  const dbOrder = {
    id: "REC-" + Date.now().toString().slice(-6),
    createdAt: new Date().toLocaleString('pt-PT'),
    trackingNumber: "N/A",
    customerInfo: {
      firstName: "Teste",
      lastName: "Automatizado",
      email: "ssilcvnt@gmail.com",
      phone: "999999999",
      address: "Rua do Teste, 123",
      city: "Luanda",
      country: "AO",
      paymentMethod: "delivery"
    },
    items: [
      {
        quantity: 1,
        selectedSize: "L",
        selectedColor: { name: "Preto", priceOverride: 18500 },
        product: { name: "T-Shirt Básica", price: 18500 }
      }
    ],
    subtotal: 18500,
    shipping: 0,
    tax: 0,
    total: 18500
  };

  try {
    console.log("Enviando pedido de teste...");
    const res = await fetch('http://127.0.0.1:3000/api/send-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dbOrder)
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Erro:", e);
  }
}

runTestOrder();
