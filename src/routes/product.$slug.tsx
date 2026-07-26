import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Star,
  Check,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  ArrowLeft,
  Clock,
  MapPin,
} from "lucide-react";
import { type Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { ProductCard } from "@/components/site/ProductCard";
import { OrderWhatsAppLink } from "@/components/site/OrderWhatsAppLink";
import { formatEGP } from "@/lib/currency";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { toast } from "sonner";
import { getProducts } from "@/services/productService";
import {
  fetchStoreSettings,
  type StoreCategory,
  type StoreSettings,
} from "@/services/settingsService";
import {
  getCategoryLabel,
  getPrimaryProductBadge,
  getProductBadgeStyle,
  mergeCategories,
} from "@/services/catalogService";

const RECENTLY_VIEWED_KEY = "badzy_recently_viewed";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const [products, settings] = await Promise.all([getProducts(), fetchStoreSettings()]);
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product, products, settings, categories: mergeCategories(settings) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product not found — Badzy" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: [product.image],
      description: product.shortDesc,
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: "Badzy Store",
      },
      offers: {
        "@type": "Offer",
        url: `https://badzystore.com/product/${product.slug}`,
        priceCurrency: "EGP",
        price: product.price,
        itemCondition: "https://schema.org/NewCondition",
        availability:
          product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    };

    return {
      meta: [
        { title: `${product.name} — Badzy Store Egypt` },
        { name: "description", content: product.shortDesc },
        { property: "og:title", content: `${product.name} — Badzy Store` },
        { property: "og:description", content: product.shortDesc },
        { property: "og:image", content: product.image },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, products, settings, categories } = Route.useLoaderData() as {
    product: Product;
    products: Product[];
    settings: StoreSettings;
    categories: StoreCategory[];
  };
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const add = useCart((s) => s.add);

  const [qty, setQty] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const galleryImages = product.images?.length ? product.images : [product.image];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= settings.lowStockThreshold;
  const primaryBadge = getPrimaryProductBadge(product, settings);
  const badgeStyle = getProductBadgeStyle(product);

  useEffect(() => {
    setSelectedImage(galleryImages[0]);
  }, [galleryImages[0], product.id]);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
      const filtered = stored.filter((id) => id !== product.id);
      filtered.unshift(product.id);
      const capped = filtered.slice(0, 8);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(capped));

      const viewedProducts = capped
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined && p.id !== product.id);
      setRecentlyViewed(viewedProducts);
    } catch {
      // ignore
    }
  }, [product.id, products]);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 pb-28 md:pb-16">
      <Link
        to="/shop"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="h-3.5 w-3.5 ltr:inline rtl:rotate-180" /> {t.cart.continueShopping}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-black aspect-square">
            <img
              src={selectedImage}
              alt={product.name}
              width={900}
              height={900}
              loading="eager"
              className={`h-full w-full object-cover ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
            />
            {primaryBadge && !isOutOfStock && (
              <span
                className="absolute left-4 top-4 rounded-sm border border-primary bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.58_0.22_25_/_0.9)]"
                style={badgeStyle}
              >
                {primaryBadge}
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-display text-sm font-bold uppercase tracking-widest text-destructive backdrop-blur-xs">
                {t.product.outOfStock}
              </span>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square overflow-hidden rounded-lg border bg-black transition ${
                    selectedImage === image ? "border-primary" : "border-border/60 hover:border-primary/60"
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {getCategoryLabel(product.category, lang, categories)}
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {lang === "ar" && product.nameAr ? product.nameAr : product.name}
          </h1>
          {lang === "ar" && <p className="mt-1 text-base text-muted-foreground">{product.name}</p>}

          {/* Rating */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating) ? "fill-primary" : "opacity-30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} · {product.reviews} {lang === "ar" ? "تقييم" : "reviews"}
            </span>
          </div>

          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            {lang === "ar" && product.shortDescAr ? product.shortDescAr : product.shortDesc}
          </p>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-foreground">
              {formatEGP(product.price * qty, lang)}
            </span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatEGP(product.oldPrice * qty, lang)}
              </span>
            )}
          </div>

          {/* Stock Badges */}
          <div className="mt-3">
            {isOutOfStock ? (
              <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" /> {t.product.outOfStock}
              </p>
            ) : isLowStock ? (
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                {t.product.onlyLeft.replace("{n}", product.stock.toString())}
              </p>
            ) : (
              <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" /> {t.product.inStock} ({product.stock})
              </p>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex h-12 items-center rounded-md border border-border bg-card">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  className="flex h-full w-11 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button
                  type="button"
                  disabled={isOutOfStock || qty >= product.stock}
                  onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
                  className="flex h-full w-11 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  add(product, qty);
                  toast.success(
                    `${qty} × ${lang === "ar" && product.nameAr ? product.nameAr : product.name} ${t.product.addToCart}`,
                  );
                }}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
              >
                {isOutOfStock
                  ? t.product.outOfStock
                  : `${t.product.addToCart} · ${formatEGP(product.price * qty, lang)}`}
              </button>
            </div>

            <OrderWhatsAppLink productName={product.name} className="w-full h-11" />
          </div>

          {/* Value Props & Shipping Table */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" /> Delivery in 2–5 days
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 1-Year Warranty
            </span>
          </div>

          {/* Delivery estimate by Governorate Table */}
          <div className="mt-6 rounded-lg border border-border/60 bg-card/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{t.product.deliveryEstimateTitle}</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.product.cairoAlex}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{t.product.restEgypt}</span>
              </li>
            </ul>
          </div>

          {/* Product Specs */}
          <div className="mt-8 rounded-lg border border-border/60 bg-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold">{t.product.specs}</h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.specs.map((s: { label: string; value: string }) => (
                <div
                  key={s.label}
                  className="flex justify-between gap-4 border-b border-border/40 pb-2 text-sm"
                >
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="text-right font-medium text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 border-t border-border/60 pt-12">
        <h2 className="mb-6 font-display text-2xl font-bold">{t.product.reviews}</h2>
        {product.sampleReviews && product.sampleReviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {product.sampleReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-lg border border-border/60 bg-card p-4 space-y-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{rev.author}</span>
                  <span className="text-xs text-muted-foreground">{rev.date}</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-primary" : "opacity-30"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "ar" && rev.commentAr ? rev.commentAr : rev.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Rated 4.8 / 5 stars based on customer feedback across Egypt.
          </p>
        )}
      </section>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">{t.product.recentlyViewed}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">{t.product.related}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div>
          <p className="text-xs font-semibold text-foreground truncate max-w-[160px]">
            {lang === "ar" && product.nameAr ? product.nameAr : product.name}
          </p>
          <p className="font-display text-sm font-bold text-primary">
            {formatEGP(product.price * qty, lang)}
          </p>
        </div>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            if (isOutOfStock) return;
            add(product, qty);
            toast.success(`${qty} × ${product.name} ${t.product.addToCart}`);
          }}
          className="h-10 rounded-md bg-primary px-5 text-xs font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-40"
        >
          {isOutOfStock ? t.product.outOfStock : t.product.addToCart}
        </button>
      </div>
    </div>
  );
}
