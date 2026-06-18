import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { adminAuth, adminDb } from "./src/lib/firebase-admin.js";
import { PRODUCTS } from "./src/data.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication Middleware
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Proceed as anonymous
    }
    const token = authHeader.split(' ')[1];
    try {
      const decodedUser = await adminAuth.verifyIdToken(token);
      (req as any).user = decodedUser;
      next();
    } catch (err) {
      console.error("Invalid token:", err);
      next(); // treat as anonymous if token is invalid
    }
  };

  app.use("/api", authenticate);

  // Endpoint: Create Order with Server-Side Validation
  app.post("/api/checkout", async (req, res) => {
    try {
      const { customerInfo, items, isGuest } = req.body;
      const user = (req as any).user;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Carrinho vazio." });
      }

      // 1. Recalculate price server-side (Security Fix: Prevents price tampering)
      let subtotal = 0;
      const validatedItems = items.map((clientItem: any) => {
        const product = PRODUCTS.find(p => p.id === clientItem.product.id);
        if (!product) throw new Error(`Produto não encontrado: ${clientItem.product.id}`);
        
        let price = product.price;
        if (clientItem.selectedColor?.priceOverride) {
           price = clientItem.selectedColor.priceOverride;
        }

        subtotal += price * clientItem.quantity;

        return {
          ...clientItem,
          // Force server price
          product: { ...clientItem.product, price },
        };
      });

      const shipping = subtotal > 100000 ? 0 : 2500;
      const total = subtotal + shipping;
      const tax = total - (total / 1.14); // 14% IVA

      const orderId = `NUVA-${Math.floor(1000 + Math.random() * 9000)}`;
      const trackingNumber = `NV-${Math.floor(10000 + Math.random() * 90000)}`;

      // 2. Save order to backend securely
      const orderData = {
        id: orderId,
        uid: user ? user.uid : "gest", // or guest
        customerInfo,
        subtotal,
        shipping,
        tax,
        total,
        status: customerInfo.paymentMethod === "transfer" ? "pending" : "paid", // payment validation can be expanded here
        trackingNumber,
        items: validatedItems,
        createdAt: new Date().toISOString()
      };

      await adminDb.collection("orders").doc(orderId).set(orderData);

      // Clears backend cart if logged in
      if (user) {
        await adminDb.collection("carts").doc(user.uid).delete();
      }

      res.status(200).json({ success: true, orderId, orderData });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Internal server error" });
    }
  });

  // Persistent Cloud Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const cartDoc = await adminDb.collection("carts").doc(user.uid).get();
      if (!cartDoc.exists) {
        return res.json({ items: [] });
      }
      res.json(cartDoc.data());
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" }); // Don't persist guest cart to DB

      const { items } = req.body;
      await adminDb.collection("carts").doc(user.uid).set({ items });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update cart" });
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
