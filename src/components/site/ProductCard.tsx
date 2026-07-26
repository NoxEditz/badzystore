import { Link } from "@tanstack/react-router";
import { Plus, Star, Heart, ShoppingCart } from "lucide-react";
import { memo, useState, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { formatEGP } from "@/lib/currency";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { toast } from "sonner";
import { getPrimaryProductBadge, getProductBadgeStyle } from "@/services/catalogService";
import { getStoreSettings } from "@/services/settingsService";
import { trackEvent } from "@/lib/analytics";

// Wishlist persisted to localStorage
function useWishlist(id: string) {
  const [wished, setWished] = useState(false);
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("badzy-wishlist") ?? "[]");
      setWished(stored.includes(id));
    } catch {
      setWished(false);
    }
  }, [id]);
  const toggle = useCallback(() => {
    setWished((prev) => {
      const stored: string[] = JSON.parse(localStorage.getItem("badzy-wishlist") ?? "[]");
      const next = prev ? stored.filter((x) => x !== id) : [...stored, id];
      localStorage.setItem("badzy-wishlist", JSON.stringify(next));
      return !prev;
    });
  }, [id]);
  return { wished, toggle };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        return (
          <Star
            key={i}
            className={`h-3 w-3 transition-colors ${
              filled
                ? "fill-amber-400 text-amber-400"
                : half
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}

export const ProductCard = memo(function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const add = useCart((s) => s.add);
  const { wished, toggle: toggleWish } = useWishlist(product.id);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [heartPopping, setHeartPopping] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= getStoreSettings().lowStockThreshold;

  const primaryBadge = getPrimaryProductBadge(product);
  const badgeStyle = getProductBadgeStyle(product);
  const primaryImage = product.images?.[0] || product.image;

  const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isOutOfStock) return;

      trackEvent("add_to_cart", {
        currency: "EGP",
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity: 1,
          },
        ],
      });

      add(product);
      setCartBouncing(true);
      setTimeout(() => setCartBouncing(false), 500);
      toast.success(
        lang === "ar" ? `✅ ${displayName} أضيف للسلة` : `✅ ${displayName} added to cart`,
        { duration: 2000 },
      );
    },
    [add, product, isOutOfStock, displayName, lang],
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      toggleWish();
      setHeartPopping(true);
      setTimeout(() => setHeartPopping(false), 350);
    },
    [toggleWish],
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_20px_50px_-20px_oklch(0.58_0.22_25_/_0.6)]">
      {/* Shine sweep */}
      <span aria-hidden className="shine-sweep-bar z-10 opacity-60" />

      {/* Image block */}
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-black/30">
          <img
            src={primaryImage}
            alt={product.name}
            width={900}
            height={900}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
              isOutOfStock ? "opacity-35 grayscale" : ""
            }`}
          />

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />

          {/* Manual/automatic product badge */}
          {primaryBadge && !isOutOfStock && (
            <span
              className="absolute left-2.5 top-2.5 z-20 rounded-md border border-primary bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_16px_-4px_oklch(0.58_0.22_25_/_0.9)]"
              style={badgeStyle}
            >
              {primaryBadge}
            </span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 font-display text-xs font-bold uppercase tracking-widest text-destructive backdrop-blur-sm">
              {t.product.outOfStock}
            </span>
          )}

          {/* Low stock warning */}
          {isLowStock && !isOutOfStock && (
            <span className="absolute right-2.5 top-2.5 z-20 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
              {t.product.onlyLeft.replace("{n}", product.stock.toString())}
            </span>
          )}

          {/* Wishlist button */}
          <button
            type="button"
            aria-label="Toggle wishlist"
            onClick={handleWishlist}
            className={`absolute right-2.5 bottom-12 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:border-rose-500/60 hover:text-rose-500 ${
              wished ? "opacity-100 !text-rose-500" : ""
            } ${heartPopping ? "heart-pop" : ""}`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${wished ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>
        </div>
      </Link>

      {/* Info block */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="min-w-0 flex-1">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            {displayName}
          </Link>
          {lang === "ar" && product.nameAr && (
            <p className="truncate text-[11px] text-muted-foreground">{product.name}</p>
          )}

          {/* Rating row */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating rating={product.rating} />
            {product.reviews > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({product.reviews.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* Price + Add to cart */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-display text-base font-bold text-foreground">
              {formatEGP(product.price, lang)}
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatEGP(product.oldPrice, lang)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className={`group/btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all duration-200 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-background ${
              cartBouncing ? "cart-btn-bounce" : ""
            }`}
          >
            {cartBouncing ? (
              <ShoppingCart className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
