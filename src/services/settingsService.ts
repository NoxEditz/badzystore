import { CONFIG } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";

export type StoreSettings = {
  freeShippingThresholdEGP: number;
  defaultShippingFeeEGP: number;
  lowStockThreshold: number;
  whatsappNumber: string;
  instapayHandle: string;
  supportEmail: string;
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
  categoriesEyebrowEn: string;
  categoriesEyebrowAr: string;
  categoriesTitleEn: string;
  categoriesTitleAr: string;
  featuredEyebrowEn: string;
  featuredEyebrowAr: string;
  featuredTitleEn: string;
  featuredTitleAr: string;
  trendingEyebrowEn: string;
  trendingEyebrowAr: string;
  trendingTitleEn: string;
  trendingTitleAr: string;
  featuredEnabled: boolean;
  trendingEnabled: boolean;
  heroSecondaryCta: string;
  trustCards: TrustCard[];
  customCategories: StoreCategory[];
  // Footer content
  footerDescriptionEn: string;
  footerDescriptionAr: string;
  footerCopyrightEn: string;
  footerCopyrightAr: string;
  footerTaglineEn: string;
  footerTaglineAr: string;
  // Homepage stats
  statsDeliverySpeedEn: string;
  statsDeliverySpeedAr: string;
  statsDeliverySpeedLabelEn: string;
  statsDeliverySpeedLabelAr: string;
  statsDeliveryScopeEn: string;
  statsDeliveryScopeAr: string;
  statsDeliveryScopeLabelEn: string;
  statsDeliveryScopeLabelAr: string;
  // Delivery estimates
  deliveryEstimateTitleEn: string;
  deliveryEstimateTitleAr: string;
  deliveryCairoAlexEn: string;
  deliveryCairoAlexAr: string;
  deliveryRestEgyptEn: string;
  deliveryRestEgyptAr: string;
  // Other content
  reviewsPlaceholderEn: string;
  reviewsPlaceholderAr: string;
  storeLocationEn: string;
  storeLocationAr: string;
  seoDescriptionEn: string;
  seoDescriptionAr: string;
  seoKeywords: string;
  storeNameEn: string;
  storeNameAr: string;
};

export type AnnouncementItem = {
  id: string;
  textEn: string;
  textAr: string;
  enabled: boolean;
};

export type TrustCard = {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
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
const STORE_SETTINGS_EVENT = "badzy:store-settings-updated";

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThresholdEGP: CONFIG.freeShippingThresholdEGP,
  defaultShippingFeeEGP: CONFIG.defaultShippingFeeEGP,
  lowStockThreshold: 5,
  whatsappNumber: CONFIG.whatsappNumber,
  instapayHandle: CONFIG.instapayHandle,
  supportEmail: "",
  announcementEnabled: true,
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
  categoriesEyebrowEn: "Shop by category",
  categoriesEyebrowAr: "تسوق حسب القسم",
  categoriesTitleEn: "Pick your weapon.",
  categoriesTitleAr: "اختر سلاحك في الجيم.",
  featuredEyebrowEn: "Featured",
  featuredEyebrowAr: "مميز",
  featuredTitleEn: "Fresh from the workbench.",
  featuredTitleAr: "أحدث المنتجات بالمخزن.",
  trendingEyebrowEn: "Trending",
  trendingEyebrowAr: "الأكثر طلباً",
  trendingTitleEn: "What players are grabbing.",
  trendingTitleAr: "المنتجات الأكثر مبيعاً في مصر.",
  featuredEnabled: true,
  trendingEnabled: true,
  heroSecondaryCta: "rgb",
  trustCards: [
    {
      id: "secure-checkout",
      titleEn: "Secure checkout",
      titleAr: "دفع آمن",
      subtitleEn: "256-bit encrypted",
      subtitleAr: "مشفر بالكامل",
      enabled: true,
    },
    {
      id: "egypt-delivery",
      titleEn: "Egypt delivery",
      titleAr: "توصيل في مصر",
      subtitleEn: "All governorates",
      subtitleAr: "كل محافظات مصر",
      enabled: true,
    },
    {
      id: "easy-returns",
      titleEn: "Easy returns",
      titleAr: "استرجاع سهل",
      subtitleEn: "Hassle-free",
      subtitleAr: "سهل وسريع",
      enabled: true,
    },
    {
      id: "warranty",
      titleEn: "Warranty",
      titleAr: "ضمان",
      subtitleEn: "On all products",
      subtitleAr: "ضمان أصلي",
      enabled: true,
    },
  ],
  customCategories: [],
  // Footer content
  footerDescriptionEn:
    "Badzy Store — Egypt's premier gaming accessories and setup gear provider. Dark aesthetics, tuned for speed.",
  footerDescriptionAr: "متجر بادزي ستور — وجهتك الأولى لمعدات القيمنق والإضاءة في مصر. جودة عالية وتوصيل سريع لكل المحافظات.",
  footerCopyrightEn: "© {year} Badzy Store Egypt. All rights reserved.",
  footerCopyrightAr: "© {year} بادزي ستور مصر. جميع الحقوق محفوظة.",
  footerTaglineEn: "Built for real Egyptian gamers.",
  footerTaglineAr: "مصمم للاعبين المصريين.",
  // Homepage stats
  statsDeliverySpeedEn: "24h",
  statsDeliverySpeedAr: "24h",
  statsDeliverySpeedLabelEn: "Fastest delivery",
  statsDeliverySpeedLabelAr: "توصيل أسرع",
  statsDeliveryScopeEn: "Egypt",
  statsDeliveryScopeAr: "مصر",
  statsDeliveryScopeLabelEn: "Nationwide",
  statsDeliveryScopeLabelAr: "توصيل لكل محافظة",
  // Delivery estimates
  deliveryEstimateTitleEn: "Estimated Delivery Times",
  deliveryEstimateTitleAr: "مواعيد التوصيل المتوقعة",
  deliveryCairoAlexEn: "Alexandria & Cairo: 1–2 Business Days",
  deliveryCairoAlexAr: "الإسكندرية والقاهرة: 1–2 يوم عمل",
  deliveryRestEgyptEn: "Rest of Egypt: 3–5 Business Days",
  deliveryRestEgyptAr: "باقي محافظات مصر: 3–5 أيام عمل",
  // Other content
  reviewsPlaceholderEn: "Rated 4.8 / 5 stars based on customer feedback across Egypt.",
  reviewsPlaceholderAr: "تقييم 4.8 / 5 نجوم بناءً على آراء العملاء في مصر.",
  storeLocationEn: "Alexandria & Cairo, Egypt",
  storeLocationAr: "الإسكندرية والقاهرة، مصر",
  seoDescriptionEn:
    "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.",
  seoDescriptionAr: "تسوق الفئران، لوحات المفاتيح الميكانيكية، إكسسوارات RGB ومعدات البث في متجر بادزي. توصيل سريع في جميع أنحاء مصر.",
  seoKeywords: "gaming gear, mice, keyboards, RGB, streaming, Badzy Store, Egypt gaming",
  storeNameEn: "Badzy Store",
  storeNameAr: "بادزي ستور",
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

export function normalizeTrustCards(value: unknown): TrustCard[] {
  const sourceItems = Array.isArray(value) ? value : DEFAULT_STORE_SETTINGS.trustCards;
  const seen = new Set<string>();
  return sourceItems
    .map((item, index) => {
      const source = item && typeof item === "object" ? (item as Partial<TrustCard>) : {};
      const titleEn = String(source.titleEn || "").trim();
      const titleAr = String(source.titleAr || titleEn).trim();
      const id = String(source.id || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `trust-${index + 1}`)
        .trim()
        .toLowerCase();
      return {
        id,
        titleEn,
        titleAr,
        subtitleEn: String(source.subtitleEn || "").trim(),
        subtitleAr: String(source.subtitleAr || source.subtitleEn || "").trim(),
        enabled: source.enabled !== false,
      };
    })
    .filter((item) => {
      if (!item.id || (!item.titleEn && !item.titleAr) || seen.has(item.id)) return false;
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
    supportEmail: source.supportEmail || DEFAULT_STORE_SETTINGS.supportEmail,
    announcementEnabled: source.announcementEnabled !== false,
    announcementTextEn: source.announcementTextEn || DEFAULT_STORE_SETTINGS.announcementTextEn,
    announcementTextAr: source.announcementTextAr || DEFAULT_STORE_SETTINGS.announcementTextAr,
    announcementItems: normalizeAnnouncementItems(source.announcementItems),
    heroTagEn: source.heroTagEn || DEFAULT_STORE_SETTINGS.heroTagEn,
    heroTagAr: source.heroTagAr || DEFAULT_STORE_SETTINGS.heroTagAr,
    heroTitleEn: source.heroTitleEn || DEFAULT_STORE_SETTINGS.heroTitleEn,
    heroTitleAr: source.heroTitleAr || DEFAULT_STORE_SETTINGS.heroTitleAr,
    heroSubtitleEn: source.heroSubtitleEn || DEFAULT_STORE_SETTINGS.heroSubtitleEn,
    heroSubtitleAr: source.heroSubtitleAr || DEFAULT_STORE_SETTINGS.heroSubtitleAr,
    categoriesEyebrowEn: source.categoriesEyebrowEn || DEFAULT_STORE_SETTINGS.categoriesEyebrowEn,
    categoriesEyebrowAr: source.categoriesEyebrowAr || DEFAULT_STORE_SETTINGS.categoriesEyebrowAr,
    categoriesTitleEn: source.categoriesTitleEn || DEFAULT_STORE_SETTINGS.categoriesTitleEn,
    categoriesTitleAr: source.categoriesTitleAr || DEFAULT_STORE_SETTINGS.categoriesTitleAr,
    featuredEyebrowEn: source.featuredEyebrowEn || DEFAULT_STORE_SETTINGS.featuredEyebrowEn,
    featuredEyebrowAr: source.featuredEyebrowAr || DEFAULT_STORE_SETTINGS.featuredEyebrowAr,
    featuredTitleEn: source.featuredTitleEn || DEFAULT_STORE_SETTINGS.featuredTitleEn,
    featuredTitleAr: source.featuredTitleAr || DEFAULT_STORE_SETTINGS.featuredTitleAr,
    trendingEyebrowEn: source.trendingEyebrowEn || DEFAULT_STORE_SETTINGS.trendingEyebrowEn,
    trendingEyebrowAr: source.trendingEyebrowAr || DEFAULT_STORE_SETTINGS.trendingEyebrowAr,
    trendingTitleEn: source.trendingTitleEn || DEFAULT_STORE_SETTINGS.trendingTitleEn,
    trendingTitleAr: source.trendingTitleAr || DEFAULT_STORE_SETTINGS.trendingTitleAr,
    featuredEnabled: source.featuredEnabled !== false,
    trendingEnabled: source.trendingEnabled !== false,
    heroSecondaryCta: source.heroSecondaryCta || DEFAULT_STORE_SETTINGS.heroSecondaryCta,
    trustCards: normalizeTrustCards(source.trustCards),
    customCategories: normalizeStoreCategories(source.customCategories),
    // Footer content
    footerDescriptionEn: source.footerDescriptionEn || DEFAULT_STORE_SETTINGS.footerDescriptionEn,
    footerDescriptionAr: source.footerDescriptionAr || DEFAULT_STORE_SETTINGS.footerDescriptionAr,
    footerCopyrightEn: source.footerCopyrightEn || DEFAULT_STORE_SETTINGS.footerCopyrightEn,
    footerCopyrightAr: source.footerCopyrightAr || DEFAULT_STORE_SETTINGS.footerCopyrightAr,
    footerTaglineEn: source.footerTaglineEn || DEFAULT_STORE_SETTINGS.footerTaglineEn,
    footerTaglineAr: source.footerTaglineAr || DEFAULT_STORE_SETTINGS.footerTaglineAr,
    // Homepage stats
    statsDeliverySpeedEn: source.statsDeliverySpeedEn || DEFAULT_STORE_SETTINGS.statsDeliverySpeedEn,
    statsDeliverySpeedAr: source.statsDeliverySpeedAr || DEFAULT_STORE_SETTINGS.statsDeliverySpeedAr,
    statsDeliverySpeedLabelEn: source.statsDeliverySpeedLabelEn || DEFAULT_STORE_SETTINGS.statsDeliverySpeedLabelEn,
    statsDeliverySpeedLabelAr: source.statsDeliverySpeedLabelAr || DEFAULT_STORE_SETTINGS.statsDeliverySpeedLabelAr,
    statsDeliveryScopeEn: source.statsDeliveryScopeEn || DEFAULT_STORE_SETTINGS.statsDeliveryScopeEn,
    statsDeliveryScopeAr: source.statsDeliveryScopeAr || DEFAULT_STORE_SETTINGS.statsDeliveryScopeAr,
    statsDeliveryScopeLabelEn: source.statsDeliveryScopeLabelEn || DEFAULT_STORE_SETTINGS.statsDeliveryScopeLabelEn,
    statsDeliveryScopeLabelAr: source.statsDeliveryScopeLabelAr || DEFAULT_STORE_SETTINGS.statsDeliveryScopeLabelAr,
    // Delivery estimates
    deliveryEstimateTitleEn: source.deliveryEstimateTitleEn || DEFAULT_STORE_SETTINGS.deliveryEstimateTitleEn,
    deliveryEstimateTitleAr: source.deliveryEstimateTitleAr || DEFAULT_STORE_SETTINGS.deliveryEstimateTitleAr,
    deliveryCairoAlexEn: source.deliveryCairoAlexEn || DEFAULT_STORE_SETTINGS.deliveryCairoAlexEn,
    deliveryCairoAlexAr: source.deliveryCairoAlexAr || DEFAULT_STORE_SETTINGS.deliveryCairoAlexAr,
    deliveryRestEgyptEn: source.deliveryRestEgyptEn || DEFAULT_STORE_SETTINGS.deliveryRestEgyptEn,
    deliveryRestEgyptAr: source.deliveryRestEgyptAr || DEFAULT_STORE_SETTINGS.deliveryRestEgyptAr,
    // Other content
    reviewsPlaceholderEn: source.reviewsPlaceholderEn || DEFAULT_STORE_SETTINGS.reviewsPlaceholderEn,
    reviewsPlaceholderAr: source.reviewsPlaceholderAr || DEFAULT_STORE_SETTINGS.reviewsPlaceholderAr,
    storeLocationEn: source.storeLocationEn || DEFAULT_STORE_SETTINGS.storeLocationEn,
    storeLocationAr: source.storeLocationAr || DEFAULT_STORE_SETTINGS.storeLocationAr,
    seoDescriptionEn: source.seoDescriptionEn || DEFAULT_STORE_SETTINGS.seoDescriptionEn,
    seoDescriptionAr: source.seoDescriptionAr || DEFAULT_STORE_SETTINGS.seoDescriptionAr,
    seoKeywords: source.seoKeywords || DEFAULT_STORE_SETTINGS.seoKeywords,
    storeNameEn: source.storeNameEn || DEFAULT_STORE_SETTINGS.storeNameEn,
    storeNameAr: source.storeNameAr || DEFAULT_STORE_SETTINGS.storeNameAr,
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

export function updateStoreSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated = normalizeStoreSettings({ ...current, ...newSettings });
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(STORE_SETTINGS_EVENT, { detail: updated }));
  }
  return updated;
}

export function subscribeToStoreSettings(
  callback: (settings: StoreSettings) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<StoreSettings>).detail;
    if (detail) callback(normalizeStoreSettings(detail));
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== LOCAL_SETTINGS_KEY || !event.newValue) return;
    try {
      callback(normalizeStoreSettings(JSON.parse(event.newValue)));
    } catch {
      // Ignore malformed storage payloads.
    }
  };

  window.addEventListener(STORE_SETTINGS_EVENT, handleCustomEvent as EventListener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(STORE_SETTINGS_EVENT, handleCustomEvent as EventListener);
    window.removeEventListener("storage", handleStorage);
  };
}
