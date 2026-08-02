import { Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { getStoreSettings, type StoreSettings } from "@/services/settingsService";
import { useState, useEffect } from "react";

const ICON_MAP = {
  lock: Lock,
  truck: Truck,
  rotateccw: RotateCcw,
  shieldcheck: ShieldCheck,
};

function getIconForTrustCard(id: string) {
  const key = id.toLowerCase();
  if (key.includes("secure") || key.includes("checkout")) return Lock;
  if (key.includes("delivery") || key.includes("shipping") || key.includes("egypt")) return Truck;
  if (key.includes("return")) return RotateCcw;
  if (key.includes("warranty") || key.includes("shield")) return ShieldCheck;
  return ShieldCheck;
}

export function Footer() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    setSettings(getStoreSettings());
  }, []);

  if (!settings) return null;

  const enabledTrustCards = settings.trustCards.filter((card) => card.enabled);
  const visibleCategories = settings.customCategories
    .filter((cat) => cat.visible !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const footerDescription = lang === "ar" ? settings.footerDescriptionAr : settings.footerDescriptionEn;
  const footerCopyright = (lang === "ar" ? settings.footerCopyrightAr : settings.footerCopyrightEn).replace(
    "{year}",
    String(new Date().getFullYear())
  );
  const footerTagline = lang === "ar" ? settings.footerTaglineAr : settings.footerTaglineEn;

  return (
    <footer className="border-t border-border/60 bg-card/40 text-muted-foreground">
      {/* Trust Badges Bar */}
      {enabledTrustCards.length > 0 && (
        <div className="border-b border-border/60 bg-card/70 py-8">
          <div className={`mx-auto max-w-7xl px-4 sm:px-6 grid gap-6 grid-cols-2 ${enabledTrustCards.length === 4 ? 'md:grid-cols-4' : enabledTrustCards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {enabledTrustCards.map((card) => {
              const Icon = getIconForTrustCard(card.id);
              return (
                <div key={card.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {lang === "ar" ? card.titleAr : card.titleEn}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {lang === "ar" ? card.subtitleAr : card.subtitleEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-muted-foreground leading-relaxed">{footerDescription}</p>
          </div>

          {visibleCategories.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {t.nav.shopAll}
              </h3>
              <ul className="space-y-2 text-xs">
                {visibleCategories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link
                      to="/shop"
                      search={{ cat: category.id }}
                      className="hover:text-foreground transition"
                    >
                      {lang === "ar" ? category.labelAr : category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Support & Policies
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/faq" className="hover:text-foreground transition">
                  {t.nav.faq}
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-foreground transition">
                  {t.nav.returns}
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="hover:text-foreground transition">
                  {t.nav.warranty}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-6 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <p>{footerCopyright}</p>
          <p className="font-mono">{footerTagline}</p>
        </div>
      </div>
    </footer>
  );
}
