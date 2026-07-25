import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatEGP } from "@/lib/currency";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { fetchStoreSettings, getStoreSettings } from "@/services/settingsService";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Badzy Store Egypt" },
      { name: "description", content: "Review your cart items before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const [settings, setSettings] = useState(() => getStoreSettings());

  useEffect(() => {
    let cancelled = false;
    fetchStoreSettings()
      .then((liveSettings) => {
        if (!cancelled) setSettings(liveSettings);
      })
      .catch((error) => console.error("Failed to load store settings", error));

    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const subtotal = cartSubtotal(lines);
  const freeThreshold = settings.freeShippingThresholdEGP;
  const shipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : settings.defaultShippingFeeEGP;
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold">{t.cart.empty}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add items to your cart to prepare your gaming gear setup.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-bold">{t.cart.title}</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-4 p-4">
              <Link
                to="/product/$slug"
                params={{ slug: l.slug }}
                className="shrink-0 overflow-hidden rounded-md border border-border/60 bg-black"
              >
                <img
                  src={l.image}
                  alt={l.name}
                  width={96}
                  height={96}
                  loading="lazy"
                  className="h-24 w-24 object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: l.slug }}
                  className="line-clamp-1 font-semibold text-sm hover:text-primary transition"
                >
                  {l.name}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground font-display">{formatEGP(l.price, lang)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex h-9 items-center rounded-md border border-border bg-background">
                    <button
                      onClick={() => setQty(l.id, l.qty - 1)}
                      className="flex h-full w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">{l.qty}</span>
                    <button
                      onClick={() => setQty(l.id, l.qty + 1)}
                      className="flex h-full w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t.cart.remove}
                  </button>
                </div>
              </div>
              <div className="font-display text-base font-bold">
                {formatEGP(l.qty * l.price, lang)}
              </div>
            </li>
          ))}
          <li className="flex justify-end p-4">
            <button
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-primary transition"
            >
              Clear cart
            </button>
          </li>
        </ul>

        <aside className="h-fit rounded-lg border border-border/60 bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">{t.checkout.summary}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
              <dd className="font-display font-semibold">{formatEGP(subtotal, lang)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.checkout.shippingFee}</dt>
              <dd className="font-display font-semibold">
                {shipping === 0 ? t.checkout.free : formatEGP(shipping, lang)}
              </dd>
            </div>
            <div className="my-3 border-t border-border/60" />
            <div className="flex justify-between text-base font-semibold">
              <dt>{t.checkout.total}</dt>
              <dd className="font-display text-xl font-bold text-primary">{formatEGP(total, lang)}</dd>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:brightness-110 shadow-lg"
          >
            {t.cart.checkout}
          </Link>
        </aside>
      </div>
    </div>
  );
}