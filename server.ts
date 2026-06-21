import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON body parser middleware
  app.use(express.json());

  // API Routes
  app.post("/api/send-order", async (req, res) => {
    try {
      const dbOrder = req.body;
      const composioUrl = process.env.COMPOSIO_URL;
      const composioKey = process.env.COMPOSIO_API_KEY;

      if (!composioUrl || !composioKey) {
        return res.status(500).json({ error: "Composio API credentials not configured inside environment variables." });
      }

      console.log("Sending order via Composio MCP");
      
      const formatPriceServer = (price: number) => {
        return new Intl.NumberFormat("pt-AO", {
          style: "currency",
          currency: "AOA",
        }).format(price);
      };

      const emailBodyHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-width: 600px; margin: 0 auto; color: #000; padding: 20px;">
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
            <td style="text-align: right; padding-top: 8px;">${dbOrder.customerInfo.paymentMethod === 'mbway' ? 'MCX EXPRESS' : 'TRANSFERÊNCIA BANCÁRIA'}</td>
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
                  ${item.quantity}x ${item.product.name}<br/>
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

      const body = {
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
        body: JSON.stringify(body)
      });

      const responseText = await composioResponse.text();
      let responseData = responseText;
      try {
        if (responseText.includes("data: ")) {
          const jsonMatch = responseText.match(/data: ({.*})/);
          if (jsonMatch && jsonMatch[1]) {
            responseData = JSON.parse(jsonMatch[1]);
          }
        } else {
          responseData = JSON.parse(responseText);
        }
      } catch(e){}

      res.json({ success: true, data: responseData });
    } catch (error: any) {
      console.error("Error sending to Composio:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
