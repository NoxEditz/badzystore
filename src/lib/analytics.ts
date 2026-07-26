import { CONFIG } from "./config";

export function initAnalytics() {
  if (typeof window === "undefined") return;

  // Google Analytics GA4
  if (CONFIG.gaMeasurementId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaMeasurementId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag("js", new Date());
    gtag("config", CONFIG.gaMeasurementId);
  }

  // Meta Pixel
  if (CONFIG.metaPixelId) {
    console.log("[Analytics] Meta Pixel Initialized:", CONFIG.metaPixelId);
  }

  // TikTok Pixel
  if (CONFIG.tiktokPixelId) {
    console.log("[Analytics] TikTok Pixel Initialized:", CONFIG.tiktokPixelId);
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params ?? {});
  }
}
