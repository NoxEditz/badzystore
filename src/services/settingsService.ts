import { CONFIG } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";

export type StoreSettings = {
  freeShippingThresholdEGP: number;
  defaultShippingFeeEGP: number;
  whatsappNumber: string;
  instapayHandle: string;
  announcementEnabled: boolean;
  announcementTextEn: string;
  announcementTextAr: string;
};

const LOCAL_SETTINGS_KEY = "badzy_store_settings";
const SUPABASE_SETTINGS_KEY = "store_settings";

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThresholdEGP: CONFIG.freeShippingThresholdEGP,
  defaultShippingFeeEGP: CONFIG.defaultShippingFeeEGP,
  whatsappNumber: CONFIG.whatsappNumber,
  instapayHandle: CONFIG.instapayHandle,
  announcementEnabled: false,
  announcementTextEn: "Free shipping on orders over 2,500 EGP!",
  announcementTextAr: "شحن مجاني للطلبات فوق 2,500 ج.م!",
};

function normalizeStoreSettings(value: unknown): StoreSettings {
  const source = value && typeof value === "object" ? (value as Partial<StoreSettings>) : {};

  return {
    freeShippingThresholdEGP: Number(source.freeShippingThresholdEGP) || DEFAULT_STORE_SETTINGS.freeShippingThresholdEGP,
    defaultShippingFeeEGP: Number(source.defaultShippingFeeEGP) || DEFAULT_STORE_SETTINGS.defaultShippingFeeEGP,
    whatsappNumber: source.whatsappNumber || DEFAULT_STORE_SETTINGS.whatsappNumber,
    instapayHandle: source.instapayHandle || DEFAULT_STORE_SETTINGS.instapayHandle,
    announcementEnabled: Boolean(source.announcementEnabled),
    announcementTextEn: source.announcementTextEn || DEFAULT_STORE_SETTINGS.announcementTextEn,
    announcementTextAr: source.announcementTextAr || DEFAULT_STORE_SETTINGS.announcementTextAr,
  };
}

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") {
    return DEFAULT_STORE_SETTINGS;
  }
  const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
    return DEFAULT_STORE_SETTINGS;
  }
  try {
    return normalizeStoreSettings(JSON.parse(stored));
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", SUPABASE_SETTINGS_KEY)
    .maybeSingle();

  if (error) throw error;

  const settings = normalizeStoreSettings(data?.value ?? DEFAULT_STORE_SETTINGS);
  updateStoreSettings(settings);
  return settings;
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const normalized = normalizeStoreSettings(settings);
  const { error } = await supabase.from("settings").upsert({
    key: SUPABASE_SETTINGS_KEY,
    value: normalized,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export function updateStoreSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated = normalizeStoreSettings({ ...current, ...newSettings });
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}
