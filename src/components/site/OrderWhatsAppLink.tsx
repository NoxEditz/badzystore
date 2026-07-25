import { MessageCircle } from "lucide-react";
import { fetchStoreSettings, getStoreSettings } from "@/services/settingsService";
import { useLang } from "@/store/lang";
import { useEffect, useState } from "react";

export function OrderWhatsAppLink({
  orderNumber,
  productName,
  className = "",
}: {
  orderNumber?: string;
  productName?: string;
  className?: string;
}) {
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

  let text = "";
  if (orderNumber) {
    text =
      lang === "ar"
        ? `مرحباً، أود تأكيد الطلب رقم #${orderNumber} والتنسيق مع المندوب.`
        : `Hi Badzy Store! I want to confirm order #${orderNumber} and arrange delivery.`;
  } else if (productName) {
    text =
      lang === "ar"
        ? `مرحباً، أود طلب المنتج (${productName}) مباشرة عبر واتساب.`
        : `Hi! I want to order ${productName} directly via WhatsApp.`;
  }

  const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#20ba59] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] ${className}`}
    >
      <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
      <span>{productName ? (lang === "ar" ? "طلب عبر واتساب" : "Order via WhatsApp") : (lang === "ar" ? "تأكيد عبر واتساب" : "Confirm via WhatsApp")}</span>
    </a>
  );
}
