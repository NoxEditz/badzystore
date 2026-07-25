import { Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";

export function Footer() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];

  return (
    <footer className="border-t border-border/60 bg-card/40 text-muted-foreground">
      {/* Trust Badges Bar */}
      <div className="border-b border-border/60 bg-card/70 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {t.trust.secureCheckout}
              </h4>
              <p className="text-[11px] text-muted-foreground">COD & Encrypted Payments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {t.trust.egyptDelivery}
              </h4>
              <p className="text-[11px] text-muted-foreground">2–5 Business Days</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {t.trust.easyReturns}
              </h4>
              <p className="text-[11px] text-muted-foreground">Hassle-free guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {t.trust.warranty}
              </h4>
              <p className="text-[11px] text-muted-foreground">Official product coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "ar"
                ? "متجر بادزي ستور — وجهتك الأولى لمعدات القيمنق والإضاءة في مصر. جودة عالية وتوصيل سريع لكل المحافظات."
                : "Badzy Store — Egypt's premier gaming accessories and setup gear provider. Dark aesthetics, tuned for speed."}
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
              {t.nav.shopAll}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shop" search={{ cat: "mice" }} className="hover:text-foreground transition">
                  {t.nav.mice}
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ cat: "keyboards" }} className="hover:text-foreground transition">
                  {t.nav.keyboards}
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ cat: "headsets" }} className="hover:text-foreground transition">
                  {t.nav.headsets}
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ cat: "rgb" }} className="hover:text-foreground transition">
                  {t.nav.rgb}
                </Link>
              </li>
            </ul>
          </div>

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

          <div>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Admin & System
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/admin" className="text-primary hover:underline font-semibold">
                  {t.nav.admin} Portal
                </Link>
              </li>
              <li className="text-muted-foreground pt-2">
                Starting in Alexandria & Shipping Nationwide, Egypt.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-6 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Badzy Store Egypt. All rights reserved.</p>
          <p className="font-mono">Built for real Egyptian gamers.</p>
        </div>
      </div>
    </footer>
  );
}