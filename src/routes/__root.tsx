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
import { SiteLayout } from "../components/site/SiteLayout";
import { CONFIG } from "../lib/config";
import { Toaster } from "sonner";
import { WhatsAppButton } from "../components/site/WhatsAppButton";
import { RouteLoadingScreen } from "../components/site/RouteLoadingScreen";
import { useLang } from "../store/lang";
import { useTheme } from "../store/theme";
import { initAnalytics } from "../lib/analytics";
import { fetchStoreSettings, getStoreSettings } from "../services/settingsService";


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[Badzy] Root error boundary caught:", error);
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
  loader: async () => {
    try {
      const settings = await fetchStoreSettings();
      return { settings };
    } catch (error) {
      console.error("Failed to load settings in root", error);
      return { settings: getStoreSettings() };
    }
  },
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const storeName = settings?.storeNameEn || "Badzy Store";
    const seoDesc = settings?.seoDescriptionEn || "Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt.";
    const seoKeywords = settings?.seoKeywords || "gaming gear, mice, keyboards, RGB, streaming, Badzy Store, Egypt gaming";
    
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: `${storeName} — Gaming gear built fast` },
        {
          name: "description",
          content: seoDesc,
        },
        { name: "keywords", content: seoKeywords },
        { name: "author", content: `${storeName} Egypt` },
        { name: "theme-color", content: "#0e0e10" },
        { property: "og:title", content: `${storeName} — Gaming gear built fast` },
        {
          property: "og:description",
          content: seoDesc,
        },
        { property: "og:image", content: "/logo.png" },
        { property: "og:url", content: `https://${CONFIG.storeDomain}` },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: storeName },
        { property: "og:locale", content: "en_EG" },
        { property: "og:locale:alternate", content: "ar_EG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${storeName} — Gaming gear built fast` },
        {
          name: "twitter:description",
          content: seoDesc,
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
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
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
          <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const loaderData = Route.useLoaderData();
  const { theme } = useTheme();
  const storeName = loaderData?.settings?.storeNameEn || "Badzy Store";

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
        document.title = `🥺 Don't forget us! - ${storeName}`;
      } else {
        document.title = originalTitle || `${storeName} — Gaming gear built fast`;
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [storeName]);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
      <RouteLoadingScreen />
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
