import { MessageCircle } from "lucide-react";
import { fetchStoreSettings, getStoreSettings } from "@/services/settingsService";
import { useLang } from "@/store/lang";
import { useEffect, useState } from "react";

export function WhatsAppButton({ productName }: { productName?: string }) {
  const { lang } = useLang();
  const [settings, setSettings] = useState(() => getStoreSettings());

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

  const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, "");

  const message = productName
    ? encodeURIComponent(
        lang === "ar"
          ? `مرحباً، أنا مهتم بمنتج ${productName} وأرغب في الاستفسار أو الطلب.`
          : `Hi, I'm interested in ${productName} and would like to order or ask a question.`,
      )
    : encodeURIComponent(
        lang === "ar"
          ? "مرحباً بادزي ستور، أرغب في الاستفسار عن المنتجات والعروض."
          : "Hi Badzy Store! I have a question about your gaming gear.",
      );

  const whatsappUrl = `https://wa.me/${rawNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Badzy Store on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_25px_rgba(37,211,102,0.5)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_30px_rgba(37,211,102,0.8)] active:scale-95 ltr:right-5 rtl:left-5 rtl:right-auto"
    >
      <MessageCircle className="h-7 w-7 fill-white text-[#25D366]" />
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white"></span>
      </span>
    </a>
  );
}
