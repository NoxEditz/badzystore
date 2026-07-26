import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Zap,
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard,
  Star,
  Package,
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";
import heroImg from "@/assets/hero.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { getProducts } from "@/services/productService";
import { fetchStoreSettings } from "@/services/settingsService";
import { mergeCategories } from "@/services/catalogService";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [products, settings] = await Promise.all([getProducts(), fetchStoreSettings()]);
    return { products, categories: mergeCategories(settings), settings };
  },
  head: () => ({
    meta: [
      { title: "Badzy Store — Gaming gear built fast" },
      {
        name: "description",
        content:
          "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.",
      },
      { property: "og:title", content: "Badzy Store — Gaming gear built fast" },
      {
        property: "og:description",
        content:
          "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.",
      },
    ],
    links: [{ rel: "preload", as: "image", href: heroImg, fetchPriority: "high" } as never],
  }),
  component: Home,
});

const CATEGORY_ICONS: Record<string, string> = {
  mice: "🖱️",
  keyboards: "⌨️",
  headsets: "🎧",
  rgb: "💡",
  streaming: "🎙️",
  seating: "🪑",
};

function HeroLogo() {
  return (
    <picture>
      <source srcSet="/logo.webp" type="image/webp" />
      <img
        src="/logo.png"
        alt="Badzy Store"
        className="h-auto object-contain"
        style={{ width: "580px" }}
        draggable={false}
      />
    </picture>
  );
}

function Home() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const { products, categories, settings } = Route.useLoaderData();

  const featured = products.filter((p) => p.badge).slice(0, 4);
  const trending = products.slice(0, 8);
  const totalProducts = products.length;
  const totalReviews = products.reduce((acc, p) => acc + p.reviews, 0);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Badzy Gaming Setup"
            width={1600}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full scale-105 object-cover opacity-55 animate-drift"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="badzy-grid animate-grid-pan absolute inset-0 opacity-40" />
          <div
            className="badzy-orb animate-drift"
            style={{
              width: 480,
              height: 480,
              left: "-8%",
              top: "15%",
              backgroundImage:
                "radial-gradient(circle, oklch(0.58 0.22 25 / 0.5) 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl items-center px-4 py-24 sm:px-6">
          {/* ── Left: Animated Logo ── */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <HeroLogo />
          </div>

          {/* ── Right: Text + CTA ── */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <Reveal>
              <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary backdrop-blur">
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_oklch(0.58_0.22_25_/_0.9)]" />
                {lang === "ar" ? settings.heroTagAr : settings.heroTagEn}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                {lang === "ar" ? settings.heroTitleAr : settings.heroTitleEn}
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                {lang === "ar" ? settings.heroSubtitleAr : settings.heroSubtitleEn}
              </p>
            </Reveal>

            <Reveal delay={240} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_10px_40px_-15px_oklch(0.58_0.22_25_/_0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_50px_-10px_oklch(0.58_0.22_25_/_0.85)] active:translate-y-0"
              >
                <span aria-hidden className="shine-sweep-bar" />
                <span className="relative">{t.hero.ctaShop}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ltr:inline rtl:rotate-180" />
              </Link>
              <Link
                to="/shop"
                search={{ cat: "rgb" }}
                className="group inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                {t.hero.ctaRgb}
                <span className="text-primary transition-transform duration-300 group-hover:rotate-90">
                  +
                </span>
              </Link>
            </Reveal>

            {/* Stats strip inline in hero */}
            <Reveal delay={320} className="mt-12 flex flex-wrap gap-6">
              {[
                { value: `${totalProducts}+`, label: lang === "ar" ? "منتج متوفر" : "Products" },
                {
                  value: `${(totalReviews / 1000).toFixed(1)}K+`,
                  label: lang === "ar" ? "تقييم" : "Reviews",
                },
                { value: "24h", label: lang === "ar" ? "توصيل أسرع" : "Fastest delivery" },
                { value: "Egypt", label: lang === "ar" ? "توصيل لكل محافظة" : "Nationwide" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-primary">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-border/70">
            <span className="animate-float mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* ── Marquee Strip ── */}
      <section className="relative overflow-hidden border-b border-border/60 bg-card/30 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        {/* Two identical copies in their own divs with trailing pr-10 so both halves are exactly equal width → seamless -50% loop */}
        <div className="animate-marquee flex w-max whitespace-nowrap text-sm">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10">
              {[
                { icon: Truck, label: t.marquee.ship24h },
                { icon: Zap, label: t.marquee.freeShipping },
                { icon: CreditCard, label: t.marquee.cod },
                { icon: ShieldCheck, label: t.marquee.warranty },
                { icon: Headphones, label: t.marquee.support },
                { icon: ShieldCheck, label: t.marquee.tested },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-3 text-muted-foreground font-medium">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{label}</span>
                  <span className="text-primary/40">◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {lang === "ar" ? "تسوق حسب القسم" : "Shop by category"}
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {lang === "ar" ? "اختر سلاحك في الجيم." : "Pick your weapon."}
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-sm font-medium text-muted-foreground transition hover:text-primary sm:inline-flex"
          >
            {t.nav.shopAll} →
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <Link
                to="/shop"
                search={{ cat: c.id }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 aspect-square transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:bg-card/80 hover:shadow-[0_15px_40px_-20px_oklch(0.58_0.22_25_/_0.7)]"
              >
                <span aria-hidden className="shine-sweep-bar" />
                <div className="text-3xl select-none">{CATEGORY_ICONS[c.id] ?? "🎮"}</div>
                <div className="relative mt-auto">
                  <div className="font-display text-sm font-bold leading-tight transition-transform duration-300 group-hover:-translate-y-0.5">
                    {lang === "ar" ? c.labelAr : c.label}
                  </div>
                  {lang !== "ar" && (
                    <div lang="ar" dir="rtl" className="text-[10px] text-muted-foreground mt-0.5">
                      {c.labelAr}
                    </div>
                  )}
                </div>
                <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full bg-primary opacity-0 shadow-[0_0_12px_2px_oklch(0.58_0.22_25_/_0.9)] transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="border-y border-border/40 bg-card/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: t.trust.secureCheckout,
                sub: lang === "ar" ? "مشفر بالكامل" : "256-bit encrypted",
              },
              {
                icon: Truck,
                title: t.trust.egyptDelivery,
                sub: lang === "ar" ? "كل محافظات مصر" : "All governorates",
              },
              {
                icon: Package,
                title: t.trust.easyReturns,
                sub: lang === "ar" ? "سهل وسريع" : "Hassle-free",
              },
              {
                icon: Star,
                title: t.trust.warranty,
                sub: lang === "ar" ? "ضمان أصلي" : "On all products",
              },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {lang === "ar" ? "مميز" : "Featured"}
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {lang === "ar" ? "أحدث المنتجات بالمخزن." : "Fresh from the workbench."}
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {lang === "ar" ? "الأكثر طلباً" : "Trending"}
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {lang === "ar" ? "المنتجات الأكثر مبيعاً في مصر." : "What players are grabbing."}
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            {t.nav.shopAll} →
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
