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

    const emailBodyHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; color: #1a1a1a; padding: 40px 20px; line-height: 1.6;">
        <div style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Cabeçalho -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">NUVA L A B S</h1>
            <p style="margin: 5px 0 0; color: #666; font-size: 12px; letter-spacing: 1px;">A CAMISETA ESSENCIAL</p>
          </div>
          
          <h2 style="font-size: 18px; font-weight: 600; text-transform: uppercase; margin-bottom: 24px;">NOVA ENCOMENDA #${dbOrder.id}</h2>

          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #000; margin-bottom: 30px;">
            <p style="margin: 0 0 10px; font-size: 14px;"><strong style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Cliente:</strong><br/>${dbOrder.customerInfo.firstName} ${dbOrder.customerInfo.lastName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Contacto:</strong><br/>${dbOrder.customerInfo.email} | ${dbOrder.customerInfo.phone}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Método Faturação:</strong><br/>${dbOrder.customerInfo.paymentMethod}</p>
            <p style="margin: 0; font-size: 14px;"><strong style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Endereço Entrega:</strong><br/>
              ${dbOrder.customerInfo.address}<br/>
              ${dbOrder.customerInfo.city}, ${dbOrder.customerInfo.postalCode ? dbOrder.customerInfo.postalCode + ', ' : ''}${dbOrder.customerInfo.country}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #eee;">
              <th style="text-align: left; padding: 10px 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">ARTIGO</th>
              <th style="text-align: right; padding: 10px 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">QTD</th>
            </tr>
            ${dbOrder.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 15px 0;">
                  <strong>${item.product?.name || 'T-shirt Essential'}</strong><br/>
                  <span style="color: #666; font-size: 12px;">Cor: ${item.selectedColor.name} | Tamanho: ${item.selectedSize}</span>
                </td>
                <td style="padding: 15px 0; text-align: right; font-weight: 600;">${item.quantity}</td>
              </tr>
            `).join('')}
          </table>

          <div style="background-color: #000; color: #fff; padding: 15px 20px; text-align: right; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 1px; opacity: 0.8;">VALOR A FATURAR</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(dbOrder.total)}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 10px; line-height: 1.5;">
            <p style="font-style: italic;">O essencial nunca sai de moda. Obrigado por apoiar a produção consciente.</p>
            <p>Apoio ao Cliente: nuva2026@proton.me | +244 941429171<br/>IG: @brancodiamante.joalheria | FB: /nuva.sho</p>
          </div>
        </div>
      </div>
    `;

    const bodyAction = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "COMPOSIO_MULTI_EXECUTE_TOOL",
        arguments: {
          tools: [
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
          ]
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
