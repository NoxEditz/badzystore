import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { type Product } from "@/data/products";
import { getProducts } from "@/services/productService";
import { ProductCard } from "@/components/site/ProductCard";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [{ title: "Search Products — Badzy Store" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const searchParams = useSearch({ from: "/search" }) as { q?: string };
  const initialQuery = searchParams.q || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fetchAndFilter = async () => {
      setLoading(true);
      try {
        const products = await getProducts();
        const q = query.toLowerCase();
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
            p.category.toLowerCase().includes(q) ||
            p.shortDesc.toLowerCase().includes(q) ||
            p.tags.some((tag) => tag.toLowerCase().includes(q)),
        );
        setResults(filtered);
      } catch (err) {
        console.error("Failed to fetch products for search", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilter();
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-xl">
        <h1 className="font-display text-3xl font-bold mb-4">{t.nav.searchPlaceholder}</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="h-12 w-full rounded-md border border-border bg-card px-4 pl-11 text-sm outline-none focus:border-primary ltr:pl-11 rtl:pr-11 rtl:pl-4"
          />
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ltr:left-3.5 rtl:right-3.5 rtl:left-auto" />
        </div>
      </div>

      {query.trim() && (
        <p className="mb-6 text-sm text-muted-foreground">
          Found <strong className="text-foreground">{results.length}</strong> results for "{query}"
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
          Loading...
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : query.trim() ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
          No products matched your search query. Try searching for "mouse", "keyboard", or "rgb".
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
          Type in the search box above to find gaming gear.
        </div>
      )}
    </div>
  );
}
