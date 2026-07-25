import { CONFIG } from "@/lib/config";

export type StoreSettings = {
  freeShippingThresholdEGP: number;
  defaultShippingFeeEGP: number;
  whatsappNumber: string;
  vodafoneCashNumber: string;
  instapayHandle: string;
  announcementEnabled: boolean;
  announcementTextEn: string;
  announcementTextAr: string;
};

const LOCAL_SETTINGS_KEY = "badzy_store_settings";

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") {
    return {
      freeShippingThresholdEGP: CONFIG.freeShippingThresholdEGP,
      defaultShippingFeeEGP: CONFIG.defaultShippingFeeEGP,
      whatsappNumber: CONFIG.whatsappNumber,
      vodafoneCashNumber: CONFIG.vodafoneCashNumber,
      instapayHandle: CONFIG.instapayHandle,
      announcementEnabled: false,
      announcementTextEn: "Free shipping on orders over 2,500 EGP!",
      announcementTextAr: "شحن مجاني للطلبات فوق 2,500 ج.م!",
    };
  }
  const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (!stored) {
    const defaults = {
      freeShippingThresholdEGP: CONFIG.freeShippingThresholdEGP,
      defaultShippingFeeEGP: CONFIG.defaultShippingFeeEGP,
      whatsappNumber: CONFIG.whatsappNumber,
      vodafoneCashNumber: CONFIG.vodafoneCashNumber,
      instapayHandle: CONFIG.instapayHandle,
      announcementEnabled: false,
      announcementTextEn: "Free shipping on orders over 2,500 EGP!",
      announcementTextAr: "شحن مجاني للطلبات فوق 2,500 ج.م!",
    };
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {
      freeShippingThresholdEGP: CONFIG.freeShippingThresholdEGP,
      defaultShippingFeeEGP: CONFIG.defaultShippingFeeEGP,
      whatsappNumber: CONFIG.whatsappNumber,
      vodafoneCashNumber: CONFIG.vodafoneCashNumber,
      instapayHandle: CONFIG.instapayHandle,
      announcementEnabled: false,
      announcementTextEn: "Free shipping on orders over 2,500 EGP!",
      announcementTextAr: "شحن مجاني للطلبات فوق 2,500 ج.م!",
    };
  }
}

export function updateStoreSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated = { ...current, ...newSettings };
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}
