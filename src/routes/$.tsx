import { createFileRoute, Link } from "@tanstack/react-router";
import { Ghost, Home, Search } from "lucide-react";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "404 Not Found — Badzy Store" },
      { name: "robots", content: "noindex" }
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Glitchy/Gamer visual effect */}
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="absolute inset-4 rounded-full bg-primary/20 blur-xl" />
        <Ghost className="relative h-16 w-16 text-primary animate-drift" />
      </div>

      <h1 className="font-display text-7xl font-bold tracking-tighter text-foreground sm:text-9xl">
        404
      </h1>
      
      <p className="mt-4 max-w-md text-lg font-medium text-foreground">
        {lang === "ar" 
          ? "المنطقة غير موجودة... هل ضللت الطريق؟"
          : "Sector not found... did you take a wrong turn?"}
      </p>
      
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {lang === "ar"
          ? "الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو أنها غير موجودة أصلًا."
          : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:brightness-110 shadow-lg shadow-primary/25"
        >
          <Home className="h-4 w-4" />
          {lang === "ar" ? "العودة للقاعدة" : "Return to Base"}
        </Link>
        <Link
          to="/shop"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-8 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          <Search className="h-4 w-4" />
          {lang === "ar" ? "تصفح المنتجات" : "Browse Gear"}
        </Link>
      </div>
    </div>
  );
}
