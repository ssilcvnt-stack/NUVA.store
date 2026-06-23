declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Default Meta Pixel ID for NUVA. Can be overridden in .env via VITE_META_PIXEL_ID
export const META_PIXEL_ID = (import.meta as any).env?.VITE_META_PIXEL_ID || "1001496935926927"; // Default NUVA Meta Pixel ID

/**
 * Generate a unique event ID for deduplication between Pixel and Conversions API
 */
export const generateEventId = () => {
  return "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
};

/**
 * Send event data asynchronously to our backend Conversions API proxy endpoint
 */
const sendCapiEvent = async (eventName: string, eventId: string, customData?: any, userData?: any) => {
  try {
    const payload = {
      eventName,
      eventId,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : "",
      customData,
      userData
    };
    
    // Background fetch to avoid blocking the main UI thread
    fetch("/api/meta-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn("[Meta CAPI] Error sending event to proxy backend:", err);
    });
  } catch (e) {
    console.warn("[Meta CAPI] Event dispatch failed:", e);
  }
};

/**
 * Initializes the Meta Pixel script dynamically in the document head.
 */
export const initMetaPixel = (pixelId: string = META_PIXEL_ID) => {
  if (typeof window === "undefined") return;

  // If already loaded, do not load again
  if (window.fbq) {
    return;
  }

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  if (window.fbq) {
    window.fbq("init", pixelId);
    // Initial PageView
    const eventId = generateEventId();
    window.fbq("track", "PageView", {}, { eventID: eventId });
    sendCapiEvent("PageView", eventId);
    console.log(`[Meta Pixel] Initialized with ID: ${pixelId}`);
  }
};

/**
 * Track PageView event
 */
export const trackPageView = () => {
  const eventId = generateEventId();
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView", {}, { eventID: eventId });
  }
  sendCapiEvent("PageView", eventId);
};

/**
 * Track ViewContent event (when a user views a product page)
 */
export const trackViewContent = (productName: string, productId: string, value: number, currency: string = "AOA") => {
  const eventId = generateEventId();
  const customData = {
    content_name: productName,
    content_ids: [productId],
    content_type: "product",
    value: value,
    currency: currency,
  };

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", customData, { eventID: eventId });
    console.log(`[Meta Pixel] Tracked ViewContent: ${productName} (${value} ${currency})`);
  }
  sendCapiEvent("ViewContent", eventId, customData);
};

/**
 * Track AddToCart event
 */
export const trackAddToCart = (productName: string, productId: string, value: number, currency: string = "AOA") => {
  const eventId = generateEventId();
  const customData = {
    content_name: productName,
    content_ids: [productId],
    content_type: "product",
    value: value,
    currency: currency,
  };

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", customData, { eventID: eventId });
    console.log(`[Meta Pixel] Tracked AddToCart: ${productName} (${value} ${currency})`);
  }
  sendCapiEvent("AddToCart", eventId, customData);
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (value: number, numItems: number, currency: string = "AOA", userData?: any) => {
  const eventId = generateEventId();
  const customData = {
    value: value,
    num_items: numItems,
    currency: currency,
  };

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", customData, { eventID: eventId });
    console.log(`[Meta Pixel] Tracked InitiateCheckout: Value: ${value} ${currency}, Items: ${numItems}`);
  }
  sendCapiEvent("InitiateCheckout", eventId, customData, userData);
};

/**
 * Track Purchase event
 */
export const trackPurchase = (value: number, currency: string = "AOA", transactionId: string, itemsCount: number, userData?: any) => {
  const eventId = "order_" + transactionId; // Unique matching identifier for perfect browser/server deduplication
  const customData = {
    value: value,
    currency: currency,
    content_type: "product",
    num_items: itemsCount,
    order_id: transactionId,
  };

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", customData, { eventID: eventId });
    console.log(`[Meta Pixel] Tracked Purchase: Value: ${value} ${currency}, ID: ${transactionId}`);
  }
  sendCapiEvent("Purchase", eventId, customData, userData);
};
