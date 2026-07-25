import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Menu, Globe, Shield, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/data/products";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "./CartDrawer";
import { useLang } from "@/store/lang";
import { useTheme } from "@/store/theme";
import { DICTIONARY } from "@/lib/i18n";

export function Header() {
  const { lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const t = DICTIONARY[lang];
  const nav = useNavigate();
  const routerState = useRouterState();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langAnimating, setLangAnimating] = useState(false);
  const [themeAnimating, setThemeAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Scroll shadow with throttle
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [routerState.location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      nav({ to: "/search", search: { q: searchQuery.trim() } });
    }
  };

  const handleLangToggle = useCallback(() => {
    setLangAnimating(true);
    setTimeout(() => {
      toggleLang();
      setLangAnimating(false);
    }, 220);
  }, [toggleLang]);

  const handleThemeToggle = useCallback(() => {
    setThemeAnimating(true);
    toggleTheme();
    setTimeout(() => setThemeAnimating(false), 600);
  }, [toggleTheme]);

  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-border/80 bg-background/95 shadow-[0_4px_30px_-8px_oklch(0_0_0/0.5)] backdrop-blur-md"
          : "border-border/40 bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6 md:gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
            <Link
              to="/shop"
              activeProps={{ className: "text-foreground font-bold active" }}
              className="nav-link-underline relative rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
            >
              {t.nav.shopAll}
            </Link>
            {CATEGORIES.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ cat: c.id }}
                className="nav-link-underline relative rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
              >
                {lang === "ar" ? c.labelAr : c.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search */}
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center animate-slide-up"
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="h-9 w-44 rounded-full border border-primary bg-background px-4 text-xs outline-none transition-all focus:ring-2 focus:ring-primary/30 sm:w-64"
              />
              <button
                type="submit"
                aria-label="Search submit"
                className="absolute ltr:right-3 rtl:left-3 text-muted-foreground hover:text-primary"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-110"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLangToggle}
            aria-label="Toggle language"
            style={{ perspective: "300px" }}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105 ${langAnimating ? "animate-lang-flip" : ""}`}
          >
            <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="uppercase tracking-wide">{lang === "en" ? "عربي" : "EN"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleThemeToggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-110 ${themeAnimating ? (isDark ? "" : "animate-sun-spin") : ""}`}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400" />
            )}
          </button>

          {/* Admin Link */}
          <Link
            to="/admin"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-110"
            title="Admin Panel"
          >
            <Shield className="h-4 w-4" />
          </Link>

          {/* Cart Drawer */}
          {mounted && <CartDrawer />}

          {/* Mobile Sheet Menu */}
          <Sheet>
            <SheetTrigger
              aria-label="Open mobile menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side={lang === "ar" ? "left" : "right"}
              className="w-72 bg-background text-foreground border-border"
            >
              <div className="mt-8 flex flex-col gap-1 text-base font-display">
                {/* Mobile lang + theme toggles */}
                <div className="mb-4 flex items-center gap-2 px-3">
                  <button
                    onClick={handleLangToggle}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-xs font-bold"
                  >
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    {lang === "en" ? "عربي" : "EN"}
                  </button>
                  <button
                    onClick={handleThemeToggle}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-xs font-bold"
                  >
                    {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                    {isDark ? (lang === "ar" ? "فاتح" : "Light") : (lang === "ar" ? "داكن" : "Dark")}
                  </button>
                </div>

                <Link to="/shop" className="rounded-lg px-3 py-2.5 font-bold hover:bg-secondary">
                  {t.nav.shopAll}
                </Link>
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.id}
                    to="/shop"
                    search={{ cat: c.id }}
                    className="rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    {lang === "ar" ? c.labelAr : c.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <Link to="/faq" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.faq}
                </Link>
                <Link to="/returns" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.returns}
                </Link>
                <Link to="/warranty" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.warranty}
                </Link>
                <Link to="/contact" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  {t.nav.contact}
                </Link>
                <Link to="/admin" className="rounded-lg px-3 py-2 text-sm text-primary hover:bg-secondary font-semibold flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  {t.nav.admin}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}