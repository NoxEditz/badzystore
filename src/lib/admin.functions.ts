import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";
import type { StoreSettings } from "@/services/settingsService";
import type { Product } from "@/data/products";

// Server-side admin auth. The passkey lives in ADMIN_PASSKEY (server env)
// and is checked with a timing-safe compare. Success stores an unlocked
// flag in an encrypted, httpOnly session cookie signed with
// ADMIN_SESSION_SECRET. The client never sees the passkey or the raw
// session value.
//
// NOTE: this file is imported by src/routes/admin.tsx, so it's reachable
// from the client bundle. Server-only APIs (`@tanstack/react-start/server`,
// service-role clients, etc.) must be dynamic-imported inside handler
// bodies — those bodies are stripped from the client bundle by TanStack.

// Hash both sides to equal-length digests before comparing — timingSafeEqual
// throws on a length mismatch, and the raw length would leak through timing.
function passkeyMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

// Very small in-memory rate limiter to slow brute-force attempts.
// Best-effort only — server instances are stateless, so this is defence-
// in-depth on top of the strong random passkey.
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function checkRateLimit(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Please wait a minute and try again.");
  }
}

function normalizeSettings(value: unknown): StoreSettings {
  const source = value && typeof value === "object" ? (value as Partial<StoreSettings>) : {};
  const customCategories = Array.isArray(source.customCategories)
    ? source.customCategories
        .map((category) => {
          const label = String(category?.label || "").trim();
          const id = String(category?.id || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
            .trim()
            .toLowerCase();
          return {
            id,
            label,
            labelAr: String(category?.labelAr || label).trim(),
            emoji: category?.emoji ? String(category.emoji).trim() : undefined,
            image: category?.image ? String(category.image).trim() : undefined,
            visible: category?.visible !== false,
            sortOrder: Number(category?.sortOrder) || 0,
          };
        })
        .filter(
          (category, index, categories) =>
            Boolean(category.id && category.label) &&
            categories.findIndex((c) => c.id === category.id) === index,
        )
    : [];

  return {
    freeShippingThresholdEGP: Number(source.freeShippingThresholdEGP) || 2500,
    defaultShippingFeeEGP: Number(source.defaultShippingFeeEGP) || 50,
    lowStockThreshold: Number(source.lowStockThreshold) || 5,
    whatsappNumber: source.whatsappNumber || "",
    instapayHandle: source.instapayHandle || "",
    announcementEnabled: source.announcementEnabled !== false,
    announcementTextEn: source.announcementTextEn || "Free shipping on orders over 2,500 EGP!",
    announcementTextAr: source.announcementTextAr || "شحن مجاني للطلبات فوق 2,500 ج.م!",
    announcementItems: Array.isArray(source.announcementItems)
      ? source.announcementItems
          .map((item, index) => {
            const textEn = String(item?.textEn || "").trim();
            const textAr = String(item?.textAr || textEn).trim();
            const id = String(
              item?.id || textEn.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `announcement-${index + 1}`,
            )
              .trim()
              .toLowerCase();
            return { id, textEn, textAr, enabled: item?.enabled !== false };
          })
          .filter((item) => item.id && (item.textEn || item.textAr))
      : [],
    heroTagEn: source.heroTagEn || "New Drop — Viper Pro Wireless",
    heroTagAr: source.heroTagAr || "منتج جديد — فايبر برو وايرلس",
    heroTitleEn: source.heroTitleEn || "Gear that moves as fast as you do.",
    heroTitleAr: source.heroTitleAr || "معدات تسبق سرعتك.",
    heroSubtitleEn:
      source.heroSubtitleEn ||
      "Performance gaming gear, fast delivery, and secure checkout for players across Egypt.",
    heroSubtitleAr:
      source.heroSubtitleAr || "معدات جيمينج احترافية، توصيل سريع، ودفع آمن للاعبين في كل مصر.",
    categoriesEyebrowEn: source.categoriesEyebrowEn || "Shop by category",
    categoriesEyebrowAr: source.categoriesEyebrowAr || "تسوق حسب القسم",
    categoriesTitleEn: source.categoriesTitleEn || "Pick your weapon.",
    categoriesTitleAr: source.categoriesTitleAr || "اختر سلاحك في الجيم.",
    featuredEyebrowEn: source.featuredEyebrowEn || "Featured",
    featuredEyebrowAr: source.featuredEyebrowAr || "مميز",
    featuredTitleEn: source.featuredTitleEn || "Fresh from the workbench.",
    featuredTitleAr: source.featuredTitleAr || "أحدث المنتجات بالمخزن.",
    trendingEyebrowEn: source.trendingEyebrowEn || "Trending",
    trendingEyebrowAr: source.trendingEyebrowAr || "الأكثر طلباً",
    trendingTitleEn: source.trendingTitleEn || "What players are grabbing.",
    trendingTitleAr: source.trendingTitleAr || "المنتجات الأكثر مبيعاً في مصر.",
    trustCards: Array.isArray(source.trustCards)
      ? source.trustCards.map((card, index) => ({
          id: String(card?.id || `trust-${index + 1}`).trim().toLowerCase(),
          titleEn: String(card?.titleEn || "").trim(),
          titleAr: String(card?.titleAr || card?.titleEn || "").trim(),
          subtitleEn: String(card?.subtitleEn || "").trim(),
          subtitleAr: String(card?.subtitleAr || card?.subtitleEn || "").trim(),
          enabled: card?.enabled !== false,
        })).filter((card) => card.id && (card.titleEn || card.titleAr))
      : [],
    customCategories,
  };
}

function normalizeProduct(value: Product): Product {
  const fallbackId = `prod_${Date.now()}`;
  const name = String(value.name || "").trim();
  if (!name) throw new Error("Product name is required.");

  const slug = String(value.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .trim()
    .toLowerCase();
  if (!slug) throw new Error("Product slug is required.");

  return {
    id: String(value.id || fallbackId),
    slug,
    name,
    nameAr: value.nameAr ? String(value.nameAr).trim() : undefined,
    category: String(value.category || "mice"),
    price: Math.max(0, Number(value.price) || 0),
    oldPrice: value.oldPrice && Number(value.oldPrice) > 0 ? Number(value.oldPrice) : undefined,
    rating: Number(value.rating) || 5,
    reviews: Number(value.reviews) || 0,
    image: String(value.image || "").trim(),
    images: Array.isArray(value.images)
      ? Array.from(new Set(value.images.map((url) => String(url).trim()).filter(Boolean)))
      : [String(value.image || "").trim()].filter(Boolean),
    shortDesc: String(value.shortDesc || "").trim(),
    shortDescAr: value.shortDescAr ? String(value.shortDescAr).trim() : undefined,
    specs: Array.isArray(value.specs) ? value.specs : [],
    stock: Math.max(0, Number(value.stock) || 0),
    tags: Array.isArray(value.tags)
      ? Array.from(new Set(value.tags.map((tag) => String(tag).trim()).filter(Boolean)))
      : [],
    badge: value.badge ? String(value.badge).trim() : undefined,
    badgeColor: value.badgeColor ? String(value.badgeColor).trim() : undefined,
    badgeTextColor: value.badgeTextColor ? String(value.badgeTextColor).trim() : undefined,
    badgeStyle: ["solid", "outline", "glow"].includes(String(value.badgeStyle))
      ? value.badgeStyle
      : undefined,
  };
}

function productToSupabasePayload(product: Product, includeExtendedBadgeColumns = true) {
  const payload: Record<string, unknown> = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    name_ar: product.nameAr,
    description: product.shortDesc,
    description_ar: product.shortDescAr,
    price_egp: product.price,
    old_price_egp: product.oldPrice,
    category: product.category,
    image: product.image,
    images: product.images || [product.image].filter(Boolean),
    stock: product.stock,
    badge: product.badge,
    specs: product.specs,
    tags: product.tags,
    rating: product.rating,
    reviews_count: product.reviews,
  };

  if (includeExtendedBadgeColumns) {
    payload.badge_color = product.badgeColor;
    payload.badge_text_color = product.badgeTextColor;
    payload.badge_style = product.badgeStyle;
  }

  return payload;
}

export const adminSignIn = createServerFn({ method: "POST" })
  .validator((data: { passkey: string }) => {
    if (
      !data ||
      typeof data.passkey !== "string" ||
      data.passkey.length < 4 ||
      data.passkey.length > 256
    ) {
      throw new Error("Invalid passkey.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    checkRateLimit("global");

    const expected =
      process.env.ADMIN_PASSKEY || (process.env.NODE_ENV !== "production" ? "6565" : "");
    if (!expected) throw new Error("ADMIN_PASSKEY is not configured on the server.");

    if (!passkeyMatches(data.passkey, expected)) {
      return { ok: false as const };
    }

    const { openAdminSession } = await import("./admin.server");
    const session = await openAdminSession();
    await session.update({ unlocked: true, since: Date.now() });
    return { ok: true as const };
  });

export const adminSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const { openAdminSession } = await import("./admin.server");
  const session = await openAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { openAdminSession } = await import("./admin.server");
  const session = await openAdminSession();
  return { authenticated: Boolean(session.data.unlocked) };
});

export const saveAdminStoreSettings = createServerFn({ method: "POST" })
  .validator((data: { settings: StoreSettings }) => {
    if (!data || !data.settings || typeof data.settings !== "object") {
      throw new Error("Invalid settings payload.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalized = normalizeSettings(data.settings);
    const { error } = await supabaseAdmin.from("settings").upsert({
      key: "store_settings",
      value: normalized,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { ok: true as const, settings: normalized };
  });

export const saveAdminProduct = createServerFn({ method: "POST" })
  .validator((data: { product: Product }) => {
    if (!data || !data.product || typeof data.product !== "object") {
      throw new Error("Invalid product payload.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const product = normalizeProduct(data.product);
    const { error } = await supabaseAdmin.from("products").upsert(productToSupabasePayload(product) as never);

    if (error) {
      const message = error.message || "";
      const missingExtendedBadgeColumn =
        message.includes("badge_color") ||
        message.includes("badge_text_color") ||
        message.includes("badge_style") ||
        message.includes("schema cache");

      if (!missingExtendedBadgeColumn) throw error;

      const fallback = await supabaseAdmin
        .from("products")
        .upsert(productToSupabasePayload(product, false) as never);
      if (fallback.error) throw fallback.error;
    }
    return { ok: true as const, product };
  });

export const updateAdminProductStock = createServerFn({ method: "POST" })
  .validator((data: { id: string; stock: number }) => {
    if (!data || typeof data.id !== "string") throw new Error("Invalid product id.");
    return { id: data.id, stock: Math.max(0, Number(data.stock) || 0) };
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({ stock: data.stock })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => {
    if (!data || typeof data.id !== "string") throw new Error("Invalid product id.");
    return data;
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });
