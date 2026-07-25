import { Link } from "@tanstack/react-router";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart, cartCount, cartSubtotal } from "@/store/cart";
import { formatEGP } from "@/lib/currency";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { CONFIG } from "@/lib/config";

export function CartDrawer({ children }: { children?: React.ReactNode }) {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const { lines, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);

  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);
  const freeThreshold = CONFIG.freeShippingThresholdEGP;
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);
  const amountAway = Math.max(0, freeThreshold - subtotal);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <button
            aria-label="Open cart"
            className="group relative inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingCart className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            <span className="hidden sm:inline">{t.nav.cart}</span>
            {count > 0 && (
              <span className="animate-pop ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-[0_0_16px_-2px_oklch(0.58_0.22_25_/_0.9)]">
                {count}
              </span>
            )}
          </button>
        )}
      </SheetTrigger>

      <SheetContent side={lang === "ar" ? "left" : "right"} className="flex flex-col w-full sm:max-w-md bg-background text-foreground border-border">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span>{t.cart.title} ({count})</span>
          </SheetTitle>
          {/* Free Shipping Progress */}
          <div className="mt-3 space-y-1.5 text-xs">
            {amountAway === 0 ? (
              <p className="font-semibold text-emerald-400">{t.cart.freeShippingQualified}</p>
            ) : (
              <p className="text-muted-foreground">
                {t.cart.freeShippingAway.replace("{amount}", formatEGP(amountAway, lang))}
              </p>
            )}
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-medium">{t.cart.empty}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              {t.cart.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card/50"
                >
                  <img
                    src={line.image}
                    alt={line.name}
                    className="h-16 w-16 rounded-md object-cover bg-black"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{line.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-display">
                      {formatEGP(line.price, lang)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded border border-border bg-background">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="font-display text-sm font-bold">
                      {formatEGP(line.price * line.qty, lang)}
                    </span>
                    <button
                      onClick={() => remove(line.id)}
                      className="text-muted-foreground hover:text-destructive text-xs transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t.cart.subtotal}</span>
                <span className="font-display text-lg text-primary">{formatEGP(subtotal, lang)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.cart.shippingCalc}</p>

              <div className="grid gap-2 pt-2">
                <Link
                  to="/checkout"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:brightness-110 transition shadow-lg"
                >
                  {t.cart.checkout}
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center h-9 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  View full cart
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
