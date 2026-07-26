import { CONFIG } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";

export type StoreSettings = {
  freeShippingThresholdEGP: number;
  defaultShippingFeeEGP: number;
  lowStockThreshold: number;
  whatsappNumber: string;
  instapayHandle: string;
  announcementEnabled: boolean;
  announcementTextEn: string;
  announcementTextAr: string;
  announcementItems: AnnouncementItem[];
  heroTagEn: string;
  heroTagAr: string;
  heroTitleEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroSubtitleAr: string;
  customCategories: StoreCategory[];
};

export type AnnouncementItem = {
  id: string;
  textEn: string;
  textAr: string;
  enabled: boolean;
};

export type StoreCategory = {
  id: string;
  label: string;
  labelAr: string;
  emoji?: string;
  image?: string;
  visible?: boolean;
  sortOrder?: number;
};

const LOCAL_SETTINGS_KEY = "badzy_store_settings";
const SUPABASE_SETTINGS_KEY = "store_settings";

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThresholdEGP: CONFIG.freeShippingThresholdEGP,
  defaultShippingFeeEGP: CONFIG.defaultShippingFeeEGP,
  lowStockThreshold: 5,
  whatsappNumber: CONFIG.whatsappNumber,
  instapayHandle: CONFIG.instapayHandle,
  announcementEnabled: false,
  announcementTextEn: "Free shipping on orders over 2,500 EGP!",
  announcementTextAr: "شحن مجاني للطلبات فوق 2,500 ج.م!",
  announcementItems: [
    {
      id: "delivery-2-5-days",
      textEn: "Delivery within 2–5 days to all governorates",
      textAr: "توصيل خلال 2-5 أيام لجميع المحافظات",
      enabled: true,
    },
    {
      id: "free-shipping-threshold",
      textEn: "Free shipping on orders over 2,500 EGP",
      textAr: "شحن مجاني للطلبات فوق 2,500 ج.م",
      enabled: true,
    },
    {
      id: "cod-available",
      textEn: "Cash on delivery available",
      textAr: "الدفع عند الاستلام متاح",
      enabled: true,
    },
    {
      id: "one-year-warranty",
      textEn: "Full one-year warranty",
      textAr: "ضمان لمدة سنة كاملة",
      enabled: true,
    },
  ],
  heroTagEn: "New Drop — Viper Pro Wireless",
  heroTagAr: "منتج جديد — فايبر برو وايرلس",
  heroTitleEn: "Gear that moves as fast as you do.",
  heroTitleAr: "معدات تسبق سرعتك.",
  heroSubtitleEn:
    "Performance gaming gear, fast delivery, and secure checkout for players across Egypt.",
  heroSubtitleAr: "معدات جيمينج احترافية، توصيل سريع، ودفع آمن للاعبين في كل مصر.",
  customCategories: [],
};

export function normalizeStoreCategories(value: unknown): StoreCategory[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value
    .map((category) => {
      const source =
        category && typeof category === "object" ? (category as Partial<StoreCategory>) : {};
      const label = String(source.label || "").trim();
      const id = String(source.id || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
        .trim()
        .toLowerCase();
      const labelAr = String(source.labelAr || label).trim();
      const emoji = source.emoji ? String(source.emoji).trim() : undefined;
      const image = source.image ? String(source.image).trim() : undefined;
      const visible = source.visible !== false;
      const sortOrder = Number(source.sortOrder) || 0;
      return { id, label, labelAr, emoji, image, visible, sortOrder };
    })
    .filter((category) => {
      if (!category.id || !category.label || seen.has(category.id)) return false;
      seen.add(category.id);
      return true;
    });
}

export function normalizeAnnouncementItems(value: unknown): AnnouncementItem[] {
  const sourceItems = Array.isArray(value) ? value : DEFAULT_STORE_SETTINGS.announcementItems;
  const seen = new Set<string>();
  return sourceItems
    .map((item, index) => {
      const source = item && typeof item === "object" ? (item as Partial<AnnouncementItem>) : {};
      const fallbackId = `announcement-${index + 1}`;
      const textEn = String(source.textEn || "").trim();
      const textAr = String(source.textAr || textEn).trim();
      const id = String(source.id || textEn.toLowerCase().replace(/[^a-z0-9]+/g, "-") || fallbackId)
        .trim()
        .toLowerCase();
      return { id, textEn, textAr, enabled: source.enabled !== false };
    })
    .filter((item) => {
      if (!item.id || (!item.textEn && !item.textAr) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export function normalizeStoreSettings(value: unknown): StoreSettings {
  const source = value && typeof value === "object" ? (value as Partial<StoreSettings>) : {};

  return {
    freeShippingThresholdEGP:
      Number(source.freeShippingThresholdEGP) || DEFAULT_STORE_SETTINGS.freeShippingThresholdEGP,
    defaultShippingFeeEGP:
      Number(source.defaultShippingFeeEGP) || DEFAULT_STORE_SETTINGS.defaultShippingFeeEGP,
    lowStockThreshold: Number(source.lowStockThreshold) || DEFAULT_STORE_SETTINGS.lowStockThreshold,
    whatsappNumber: source.whatsappNumber || DEFAULT_STORE_SETTINGS.whatsappNumber,
    instapayHandle: source.instapayHandle || DEFAULT_STORE_SETTINGS.instapayHandle,
    announcementEnabled: Boolean(source.announcementEnabled),
    announcementTextEn: source.announcementTextEn || DEFAULT_STORE_SETTINGS.announcementTextEn,
    announcementTextAr: source.announcementTextAr || DEFAULT_STORE_SETTINGS.announcementTextAr,
    announcementItems: normalizeAnnouncementItems(source.announcementItems),
    heroTagEn: source.heroTagEn || DEFAULT_STORE_SETTINGS.heroTagEn,
    heroTagAr: source.heroTagAr || DEFAULT_STORE_SETTINGS.heroTagAr,
    heroTitleEn: source.heroTitleEn || DEFAULT_STORE_SETTINGS.heroTitleEn,
    heroTitleAr: source.heroTitleAr || DEFAULT_STORE_SETTINGS.heroTitleAr,
    heroSubtitleEn: source.heroSubtitleEn || DEFAULT_STORE_SETTINGS.heroSubtitleEn,
    heroSubtitleAr: source.heroSubtitleAr || DEFAULT_STORE_SETTINGS.heroSubtitleAr,
    customCategories: normalizeStoreCategories(source.customCategories),
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
