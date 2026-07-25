import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CATEGORIES, PRODUCTS, type Category } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";

const searchSchema = z.object({
  cat: z
    .enum(["mice", "keyboards", "headsets", "rgb", "streaming", "seating"])
    .optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Shop Gaming Gear — Badzy Store Egypt" },
      {
        name: "description",
        content:
          "Browse mice, mechanical keyboards, headsets, RGB accessories and streaming gear at Badzy Store Egypt.",
      },
      { property: "og:title", content: "Shop — Badzy Store Egypt" },
      { property: "og:description", content: "Browse the full Badzy catalog." },
    ],
  }),
  component: Shop,
});

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

function Shop() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const { cat } = Route.useSearch();
  const [sort, setSort] = useState<Sort>("featured");
  const active: Category | "all" = cat ?? "all";

  const products = useMemo(() => {
    const base =
      active === "all" ? [...PRODUCTS] : PRODUCTS.filter((p) => p.category === active);
    switch (sort) {
      case "price-asc":
        return base.sort((a, b) => a.price - b.price);
      case "price-desc":
        return base.sort((a, b) => b.price - a.price);
      case "rating":
        return base.sort((a, b) => b.rating - a.rating);
      default:
        return base;
    }
  }, [active, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {lang === "ar" ? "الكتالوج" : "Catalog"}
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {active === "all"
            ? t.nav.shopAll
            : lang === "ar"
            ? CATEGORIES.find((c) => c.id === active)?.labelAr
            : CATEGORIES.find((c) => c.id === active)?.label}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} {lang === "ar" ? "منتج متوفر بالمخزن" : `product${products.length === 1 ? "" : "s"} in stock`}.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
        <Link
          to="/shop"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            active === "all"
              ? "border-primary bg-primary text-primary-foreground font-semibold"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {lang === "ar" ? "الكل" : "All"}
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ cat: c.id }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active === c.id
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {lang === "ar" ? c.labelAr : c.label}
          </Link>
        ))}

        <div className="ml-auto ltr:ml-auto rtl:mr-auto rtl:ml-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-primary"
          >
            <option value="featured">{lang === "ar" ? "المميز" : "Featured"}</option>
            <option value="price-asc">{lang === "ar" ? "السعر: الأقل إلى الأعلى" : "Price: low → high"}</option>
            <option value="price-desc">{lang === "ar" ? "السعر: الأعلى إلى الأقل" : "Price: high → low"}</option>
            <option value="rating">{lang === "ar" ? "الأعلى تقييماً" : "Top rated"}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}