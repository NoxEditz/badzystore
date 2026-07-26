import type { CSSProperties } from "react";
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
  const merged = new Map<string, CatalogCategory>();

  for (const category of CATEGORIES) {
    merged.set(category.id, { ...category });
  }

  for (const category of settings.customCategories) {
    const existing = merged.get(category.id);
    merged.set(category.id, {
      ...(existing ?? { id: category.id, label: category.label, labelAr: category.labelAr }),
      ...existing,
      ...category,
      id: category.id,
    });
  }

  return Array.from(merged.values())
    .filter((category) => category.visible !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) as CatalogCategory[];
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

export function getProductBadgeStyle(product: Product): CSSProperties | undefined {
  if (!product.badgeColor && !product.badgeTextColor) return undefined;
  return {
    backgroundColor: product.badgeStyle === "outline" ? "transparent" : product.badgeColor,
    borderColor: product.badgeColor,
    color: product.badgeTextColor,
    boxShadow:
      product.badgeStyle === "glow" && product.badgeColor
        ? `0 0 20px -4px ${product.badgeColor}`
        : undefined,
  };
}
