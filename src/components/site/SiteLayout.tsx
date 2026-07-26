import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useEffect, useState } from "react";
import { fetchStoreSettings, getStoreSettings, type StoreSettings } from "@/services/settingsService";
import { useLang } from "@/store/lang";
import { X } from "lucide-react";

function AnnouncementBanner() {
  const { lang } = useLang();
  const [settings, setSettings] = useState<StoreSettings>(() => getStoreSettings());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchStoreSettings()
      .then((liveSettings) => {
        if (!cancelled) setSettings(liveSettings);
      })
      .catch((error) => console.error("Failed to load store settings", error));

    return () => {
      cancelled = true;
    };
  }, []);

  const enabledItems = settings.announcementItems.filter((item) => item.enabled);
  const fallbackText = lang === "ar" ? settings.announcementTextAr : settings.announcementTextEn;

  if (!settings.announcementEnabled || !visible) return null;

  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-primary px-10 py-2 text-center text-xs font-bold text-primary-foreground sm:text-sm">
      {enabledItems.length > 0 ? (
        <div className="flex max-w-full items-center gap-3 overflow-x-auto scrollbar-none">
          {enabledItems.map((item) => (
            <span key={item.id} className="shrink-0 rounded-full bg-primary-foreground/12 px-3 py-1">
              {lang === "ar" ? item.textAr : item.textEn}
            </span>
          ))}
        </div>
      ) : (
        <span>{fallbackText}</span>
      )}
      <button 
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}