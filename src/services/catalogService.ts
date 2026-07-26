import { CATEGORIES, type Category, type Product } from "@/data/products";
import {
  fetchStoreSettings,
  getStoreSettings,
  type StoreCategory,
  type StoreSettings,
} from "@/services/settingsService";

export type CatalogCategory = StoreCategory & { id: Category };

export function mergeCategories(
  settings: Pick<StoreSettings, "customCategories"> = getStoreSettings(),
): CatalogCategory[] {
  const seen = new Set<string>();
  return [...CATEGORIES, ...settings.customCategories].filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  }) as CatalogCategory[];
}

export async function fetchCatalogCategories(): Promise<CatalogCategory[]> {
  const settings = await fetchStoreSettings();
  return mergeCategories(settings);
}

export function getCategoryLabel(
  categoryId: string,
  lang: "en" | "ar",
  categories = mergeCategories(),
): string {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return categoryId;
  return lang === "ar" ? category.labelAr || category.label : category.label;
}

export function getDiscountPercent(product: Product): number | null {
  return product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;
}

export function getPrimaryProductBadge(
  product: Product,
  settings: Pick<StoreSettings, "lowStockThreshold"> = getStoreSettings(),
): string | undefined {
  const manual = product.badge?.trim();
  if (manual) return manual;

  const discountPct = getDiscountPercent(product);
  if (discountPct) return `-${discountPct}%`;

  if (product.stock > 0 && product.stock <= settings.lowStockThreshold) return "Low stock";
  if (product.tags.some((tag) => ["new", "new-release", "new release"].includes(tag.toLowerCase())))
    return "New";
  if (
    product.tags.some((tag) =>
      ["best-seller", "best seller", "bestseller"].includes(tag.toLowerCase()),
    )
  )
    return "Best seller";
  return undefined;
}
