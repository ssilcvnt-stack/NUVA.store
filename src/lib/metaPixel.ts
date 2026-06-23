declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Default Meta Pixel ID for NUVA. Can be overridden in .env via VITE_META_PIXEL_ID
export const META_PIXEL_ID = (import.meta as any).env?.VITE_META_PIXEL_ID || "1001496935926927"; // Default NUVA Meta Pixel ID

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
    window.fbq("track", "PageView");
    console.log(`[Meta Pixel] Initialized with ID: ${pixelId}`);
  }
};

/**
 * Track PageView event
 */
export const trackPageView = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

/**
 * Track ViewContent event (when a user views a product page)
 */
export const trackViewContent = (productName: string, productId: string, value: number, currency: string = "AOA") => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: productName,
      content_ids: [productId],
      content_type: "product",
      value: value,
      currency: currency,
    });
    console.log(`[Meta Pixel] Tracked ViewContent: ${productName} (${value} ${currency})`);
  }
};

/**
 * Track AddToCart event
 */
export const trackAddToCart = (productName: string, productId: string, value: number, currency: string = "AOA") => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: productName,
      content_ids: [productId],
      content_type: "product",
      value: value,
      currency: currency,
    });
    console.log(`[Meta Pixel] Tracked AddToCart: ${productName} (${value} ${currency})`);
  }
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (value: number, numItems: number, currency: string = "AOA") => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: value,
      num_items: numItems,
      currency: currency,
    });
    console.log(`[Meta Pixel] Tracked InitiateCheckout: Value: ${value} ${currency}, Items: ${numItems}`);
  }
};

/**
 * Track Purchase event
 */
export const trackPurchase = (value: number, currency: string = "AOA", transactionId: string, itemsCount: number) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value: value,
      currency: currency,
      content_type: "product",
      num_items: itemsCount,
      order_id: transactionId,
    });
    console.log(`[Meta Pixel] Tracked Purchase: Value: ${value} ${currency}, ID: ${transactionId}`);
  }
};
