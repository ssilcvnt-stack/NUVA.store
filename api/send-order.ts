import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let order = req.body;
    if (typeof order === 'string') {
      try {
        order = JSON.parse(order);
      } catch (e) {
        console.error("Failed to parse request body as JSON string", e);
      }
    }

    if (!order) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    // Ensure items are array and customerInfo exists
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const customerInfo = order.customerInfo || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      paymentMethod: ""
    };
    
    // Simulate slow processing like save to DB
    await new Promise(resolve => setTimeout(resolve, 800));

    // Save to our pseudo-DB (it won't persist across vercel serverless invocations, but just mapping to same structure)
    const dbOrder = { 
      ...order, 
      items: orderItems,
      customerInfo,
      id: order.id || `NV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}` 
    };
    
    const composioUrl = process.env.COMPOSIO_URL;
    const composioKey = process.env.COMPOSIO_API_KEY;

    if (!composioUrl || !composioKey) {
      console.error("Missing Composio credentials for webhooks");
      return res.status(200).json({ success: true, warning: 'Email not sent due to missing credentials' });
    }

    const formatPriceServer = (price: number) => {
      return new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
      }).format(price);
    };

    let paymentMethodText = "TRANSFERÊNCIA BANCÁRIA";
    if (dbOrder.customerInfo.paymentMethod === 'vanqir_mcx' || dbOrder.customerInfo.paymentMethod === 'mbway') {
      paymentMethodText = 'MCX EXPRESS';
    } else if (dbOrder.customerInfo.paymentMethod === 'vanqir_ref') {
      paymentMethodText = 'REFERÊNCIA';
    } else if (dbOrder.customerInfo.paymentMethod === 'delivery') {
      paymentMethodText = 'PAGAMENTO NA ENTREGA';
    }

    const emailBodyHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #000; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NUVA</h1>
          <p style="margin: 5px 0 0; color: #666; font-size: 12px; letter-spacing: 1px;">Less. Better.</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <table style="width: 100%; font-size: 12px; text-transform: uppercase;">
          <tr>
            <td style="font-weight: bold;">RECIBO:</td>
            <td style="text-align: right;">${dbOrder.id}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-top: 8px;">DATA:</td>
            <td style="text-align: right; padding-top: 8px;">${dbOrder.createdAt || new Date().toLocaleString('pt-PT')}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-top: 8px;">PAGAMENTO:</td>
            <td style="text-align: right; padding-top: 8px;">${paymentMethodText}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-top: 8px;">LOGÍSTICA:</td>
            <td style="text-align: right; padding-top: 8px;">${dbOrder.trackingNumber}</td>
          </tr>
        </table>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

        <div style="font-size: 12px;">
          <p style="font-weight: bold; margin-bottom: 10px;">INFORMAÇÕES DO CLIENTE</p>
          <p style="margin: 5px 0;">Nome: ${dbOrder.customerInfo.firstName} ${dbOrder.customerInfo.lastName}</p>
          <p style="margin: 5px 0;">Email: ${dbOrder.customerInfo.email}</p>
          <p style="margin: 5px 0;">Telefone: ${dbOrder.customerInfo.phone}</p>
          <p style="margin: 5px 0;">Morada: ${dbOrder.customerInfo.address}, ${dbOrder.customerInfo.city}, ${dbOrder.customerInfo.country}</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

        <div style="font-size: 12px;">
          <p style="font-weight: bold; margin-bottom: 10px;">ARTIGOS ADQUIRIDOS</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${dbOrder.items.map((item: any) => `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">
                  ${item.quantity}x ${item.product?.name || 'T-shirt Essential'}<br/>
                  <span style="color: #666; font-size: 10px;">(Cor: ${item.selectedColor.name} | Tam: ${item.selectedSize})</span>
                </td>
                <td style="text-align: right; padding: 8px 0; border-bottom: 1px dotted #ccc;">
                  ${formatPriceServer((item.selectedColor.priceOverride || item.product.price) * item.quantity)}
                </td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div style="font-size: 12px; margin-top: 15px;">
          <table style="width: 100%;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatPriceServer(dbOrder.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding-top: 5px;">Portes de Envio:</td>
              <td style="text-align: right; padding-top: 5px;">${dbOrder.shipping === 0 ? "GRÁTIS" : formatPriceServer(dbOrder.shipping)}</td>
            </tr>
            <tr>
              <td style="padding-top: 5px;">Impostos Locais:</td>
              <td style="text-align: right; padding-top: 5px;">${formatPriceServer(dbOrder.tax)}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; margin-top: 10px; padding-top: 15px; font-size: 14px;">TOTAL INVESTIDO:</td>
              <td style="text-align: right; font-weight: bold; padding-top: 15px; font-size: 14px;">${formatPriceServer(dbOrder.total)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 10px; line-height: 1.5;">
          <p style="font-style: italic;">O essencial nunca sai de moda. Obrigado por apoiar a produção consciente.</p>
          <p>Apoio ao Cliente: nuva2026@proton.me | +244 941429171<br/>IG: @brancodiamante.joalheria | FB: /nuva.sho</p>
        </div>
      </div>
    `;

    const toolsList: any[] = [
      {
        tool_slug: "GMAIL_SEND_EMAIL",
        arguments: {
          to: "ssilcvnt@gmail.com",
          subject: `Novo Pedido NUVA LABS (${dbOrder.id})`,
          body: emailBodyHTML,
          is_html: true
        }
      },
      {
        tool_slug: "GMAIL_SEND_EMAIL",
        arguments: {
          to: "nuva2026@proton.me",
          subject: `Novo Pedido NUVA LABS (${dbOrder.id})`,
          body: emailBodyHTML,
          is_html: true
        }
      }
    ];

    const sheetId = process.env.GOOGLE_SHEET_ID || "16pfzV7nyyOA8eJrpFUEIoRllpz3Rf1CTTXfWS_qotW8";
    if (sheetId) {
      toolsList.push({
        tool_slug: "GOOGLESHEETS_UPSERT_ROWS",
        arguments: {
          spreadsheetId: sheetId,
          sheetName: "Página1",
          keyColumn: "ID",
          headers: ["ID", "Data", "Nome", "Email", "Telefone", "Morada", "Pagamento", "Total", "Artigos"],
          rows: [
            [
              dbOrder.id,
              dbOrder.createdAt || new Date().toLocaleString('pt-PT'),
              `${dbOrder.customerInfo.firstName} ${dbOrder.customerInfo.lastName}`,
              dbOrder.customerInfo.email,
              dbOrder.customerInfo.phone,
              `${dbOrder.customerInfo.address}, ${dbOrder.customerInfo.city}`,
              paymentMethodText,
              dbOrder.total,
              dbOrder.items.map((i: any) => `${i.quantity}x ${i.product.name} (${i.selectedColor.name}, Tam: ${i.selectedSize})`).join(" | ")
            ]
          ]
        }
      });
    }

    const bodyAction = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "COMPOSIO_MULTI_EXECUTE_TOOL",
        arguments: {
          tools: toolsList
        }
      },
      id: 1
    };

    const composioResponse = await fetch(composioUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": `Bearer ${composioKey}`,
        "x-api-key": composioKey
      },
      body: JSON.stringify(bodyAction)
    });

    const responseText = await composioResponse.text();
    console.log("Composio webhook response (Vercel):", composioResponse.status, responseText);
    
    return res.status(200).json({ success: true, orderId: dbOrder.id });
  } catch (error) {
    console.error("Vercel Function Error (send-order):", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
