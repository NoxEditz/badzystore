import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "../components/site/SiteLayout";
import { Toaster } from "sonner";
import { WhatsAppButton } from "../components/site/WhatsAppButton";
import { useLang } from "../store/lang";
import { useTheme } from "../store/theme";
import { initAnalytics } from "../lib/analytics";

function NotFoundComponent() {
  const { lang } = useLang();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {lang === "ar" ? "الصفحة غير موجودة" : "Page not found"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "ar"
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {lang === "ar" ? "العودة للرئيسية" : "Go home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Badzy Store — Gaming gear built fast" },
      {
        name: "description",
        content:
          "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.",
      },
      { name: "keywords", content: "gaming gear, mice, keyboards, RGB, streaming, Badzy Store, Egypt gaming" },
      { name: "author", content: "Badzy Store Egypt" },
      { name: "theme-color", content: "#0e0e10" },
      { property: "og:title", content: "Badzy Store — Gaming gear built fast" },
      {
        property: "og:description",
        content:
          "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.",
      },
      { property: "og:image", content: "/logo.png" },
      { property: "og:url", content: "https://badzystore.com" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Badzy Store" },
      { property: "og:locale", content: "en_EG" },
      { property: "og:locale:alternate", content: "ar_EG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Badzy Store — Gaming gear built fast" },
      {
        name: "twitter:description",
        content:
          "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.",
      },
      { name: "twitter:image", content: "/logo.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&family=Cairo:wght@400;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/favicon-192.png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const { theme } = useTheme();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
          {children}
          <Toaster theme={theme as any} className="toaster group" />
          <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { theme } = useTheme();

  useEffect(() => {
    initAnalytics();
  }, []);

  // Sync theme class whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  // Dynamic tab title on visibility change
  useEffect(() => {
    let originalTitle = document.title;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        originalTitle = document.title;
        document.title = "🥺 Don't forget us! - Badzy Store";
      } else {
        document.title = originalTitle || "Badzy Store — Gaming gear built fast";
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
      <WhatsAppButton />
      <Toaster theme={theme} position="top-center" richColors />
      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id="badzy-rgb-stroke">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="DILATED" />
          <feFlood floodColor="#ff0000" floodOpacity="1" result="RED" />
          <feComposite in="RED" in2="DILATED" operator="in" result="OUTLINE" />
        </filter>
      </svg>
    </QueryClientProvider>
  );
}
