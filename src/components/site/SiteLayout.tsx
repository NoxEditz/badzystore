import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useEffect, useState } from "react";
import { getStoreSettings, type StoreSettings } from "@/services/settingsService";
import { useLang } from "@/store/lang";
import { X } from "lucide-react";

function AnnouncementBanner() {
  const { lang } = useLang();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setSettings(getStoreSettings());
  }, []);

  if (!settings?.announcementEnabled || !visible) return null;

  return (
    <div className="relative flex items-center justify-center bg-primary px-4 py-2 text-center text-xs font-bold text-primary-foreground sm:text-sm">
      <span>{lang === "ar" ? settings.announcementTextAr : settings.announcementTextEn}</span>
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