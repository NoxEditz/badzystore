// Application Environment & Integration Config

export const CONFIG = {
  // Store Details
  storeName: "Badzy Store",
  storeDomain: import.meta.env.VITE_STORE_DOMAIN || "badzystore.com",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "201012345678", // Default Egyptian WhatsApp format
  instapayHandle: import.meta.env.VITE_INSTAPAY_HANDLE || "badzystore@instapay",

  // E-commerce thresholds
  freeShippingThresholdEGP: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 2500,
  defaultShippingFeeEGP: Number(import.meta.env.VITE_DEFAULT_SHIPPING_FEE) || 50,

  // Payment Gateways (public keys only)
  paymobPublicKey: import.meta.env.VITE_PAYMOB_PUBLIC_KEY || "",
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",

  // Shipping Courier APIs (public identifiers only)
  bostaApiKey: import.meta.env.VITE_BOSTA_API_KEY || "",
  mylerzApiKey: import.meta.env.VITE_MYLERZ_API_KEY || "",

  // Analytics Pixels
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || "",
  tiktokPixelId: import.meta.env.VITE_TIKTOK_PIXEL_ID || "",
};
