import { INITIAL_PRODUCTS, type Product } from "@/data/products";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const LOCAL_PRODUCTS_KEY = "badzy_store_products";

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
  description?: string | null;
  description_ar?: string | null;
  specs?: string[] | null;
  stock?: number | string | null;
  tags?: string[] | null;
  badge?: Product["badge"];
};

function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  }
}

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data && data.length > 0) {
        return (data as ProductRow[]).map((item) => ({
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
          shortDesc: item.description || "",
          shortDescAr: item.description_ar,
          specs: item.specs || [],
          stock: Number(item.stock || 0),
          tags: item.tags || [],
          badge: item.badge,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local database:", e);
    }
  }
  return getLocalProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function updateProductStock(id: string, newStock: number): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock: Math.max(0, newStock) })
        .eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase stock update error:", e);
      throw e;
    }
  }
  const products = getLocalProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index].stock = Math.max(0, newStock);
    saveLocalProducts(products);
    return true;
  }
  return false;
}

export async function saveProduct(product: Product): Promise<Product> {
  const products = getLocalProducts();
  const index = products.findIndex((p) => p.id === product.id);

  if (index !== -1) {
    products[index] = product;
  } else {
    products.push(product);
  }
  saveLocalProducts(products);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("products").upsert({
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
        stock: product.stock,
        badge: product.badge,
        specs: product.specs,
        tags: product.tags,
      });
      if (error) throw error;
    } catch (e) {
      console.error("Supabase product save error:", e);
      throw e;
    }
  }

  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = getLocalProducts().filter((p) => p.id !== id);
  saveLocalProducts(products);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Supabase product delete error:", e);
      throw e;
    }
  }
  return true;
}
