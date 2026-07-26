import { INITIAL_PRODUCTS, type Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { uploadAdminImage } from "@/lib/admin.functions";

/**
 * Read-only public catalog access.
 *
 * Writes (create / update / delete / stock changes) are NEVER done from the
 * browser — they live in server functions (`src/lib/admin.functions.ts`,
 * `src/lib/orders.functions.ts`) behind the admin session / service role.
 * There is also no localStorage mirror anymore: it used to cache the catalog
 * forever and silently hide backend failures.
 */

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  name_ar?: string;
  category: Product["category"];
  price_egp: number | string;
  old_price_egp?: number | string | null;
  rating?: number | string | null;
  reviews_count?: number | string | null;
  image: string;
  images?: string[] | null;
  description?: string | null;
  description_ar?: string | null;
  specs?: unknown;
  stock?: number | string | null;
  tags?: string[] | null;
  badge?: Product["badge"];
  badge_color?: string | null;
  badge_text_color?: string | null;
  badge_style?: Product["badgeStyle"] | null;
  created_at?: string | null;
};

function normalizeSpecs(value: unknown): Product["specs"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object") {
        const source = item as { label?: unknown; value?: unknown };
        const label = String(source.label || "").trim();
        const specValue = String(source.value || "").trim();
        if (label && specValue) return { label, value: specValue };
      }
      return null;
    })
    .filter((item): item is { label: string; value: string } => item !== null);
}

export function mapProductRow(item: ProductRow): Product {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    nameAr: item.name_ar,
    category: item.category,
    price: Number(item.price_egp),
    oldPrice: item.old_price_egp ? Number(item.old_price_egp) : undefined,
    rating: Number(item.rating || 5.0),
    reviews: Number(item.reviews_count || 0),
    image: item.image,
    images: item.images?.length ? item.images : item.image ? [item.image] : [],
    shortDesc: item.description || "",
    shortDescAr: item.description_ar || undefined,
    specs: normalizeSpecs(item.specs),
    stock: Number(item.stock || 0),
    tags: item.tags || [],
    badge: item.badge,
    badgeColor: item.badge_color || undefined,
    badgeTextColor: item.badge_text_color || undefined,
    badgeStyle: item.badge_style || undefined,
  };
}

/**
 * Fetches the catalog. Throws on a backend error so callers can render a real
 * error state instead of pretending the store is empty.
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error);
    throw error;
  }

  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load product:", error);
    throw error;
  }

  return data ? mapProductRow(data as ProductRow) : undefined;
}

/**
 * The bundled demo catalog. Kept only as the source used to seed the database
 * (see supabase/migrations) and for local design work — never used as a silent
 * runtime fallback anymore.
 */
export { INITIAL_PRODUCTS };

export async function uploadProductImage(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await uploadAdminImage({
    data: {
      name: file.name,
      type: file.type,
      base64,
      bucket: "product-images",
    },
  });

  if (res.error) throw new Error(res.error.message || "Upload failed");
  return res.url;
}
