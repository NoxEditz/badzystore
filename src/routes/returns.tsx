import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useLang } from "@/store/lang";
import { useState, useEffect } from "react";
import { fetchStoreSettings, getStoreSettings } from "@/services/settingsService";
import { formatEGP } from "@/lib/currency";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns Policy — Badzy Store" },
      { name: "description", content: "Shipping fees, delivery timelines, and 14-day return guidelines for Badzy Store Egypt." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
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

  const isAr = lang === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RotateCcw className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {isAr ? "سياسة الشحن والإرجاع" : "Shipping & Returns Policy"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAr ? "سياسات واضحة وصادقة مصممة للمتسوقين في مصر." : "Clear, honest policies designed for Egyptian shoppers."}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            {isAr ? "1. الشحن لجميع أنحاء مصر" : "1. Shipping Nationwide in Egypt"}
          </h2>
          <p>
            {isAr
              ? "نشحن لجميع المحافظات الـ 27 في مصر. الطلبات التي تُسجَّل قبل الساعة 3 مساءً بتوقيت القاهرة تُشحَّن في نفس اليوم."
              : "We ship to all 27 Egyptian governorates. Orders placed before 3 PM Cairo time are dispatched on the same business day."}
          </p>
          <ul className={`list-disc space-y-1 ${isAr ? "pr-5" : "pl-5"}`}>
            <li>
              {isAr
                ? "الإسكندرية والقاهرة والجيزة: 1–2 يوم عمل"
                : "Alexandria & Cairo / Giza: 1–2 Business Days"}
            </li>
            <li>
              {isAr
                ? "محافظات الدلتا والقناة: 2–3 أيام عمل"
                : "Delta & Canal Governorates: 2–3 Business Days"}
            </li>
            <li>
              {isAr
                ? "الصعيد والمحافظات الساحلية: 3–5 أيام عمل"
                : "Upper Egypt & Coastal Governorates: 3–5 Business Days"}
            </li>
            <li>
              {isAr
                ? `شحن مجاني: يُطبَّق تلقائياً على الطلبات التي تتجاوز ${formatEGP(settings.freeShippingThresholdEGP, lang)}.`
                : `Free Shipping: Automatically applied on all orders exceeding ${formatEGP(settings.freeShippingThresholdEGP, lang)}.`}
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            {isAr ? "2. سياسة الإرجاع لمدة 14 يوماً" : "2. 14-Day Easy Return Policy"}
          </h2>
          <p>
            {isAr
              ? "وفقاً لقوانين حماية المستهلك المصرية، لديك 14 يوماً من تاريخ الاستلام لإرجاع أي منتج أو استبداله."
              : "Under Egyptian Consumer Protection regulations, you have 14 days from the date of delivery to return or exchange any item."}
          </p>
          <ul className={`list-disc space-y-1 ${isAr ? "pr-5" : "pl-5"}`}>
            <li>
              {isAr
                ? "يجب أن يكون المنتج غير مستخدم، ومغلفاً في عبوته الأصلية مع جميع الملحقات المرفقة."
                : "Item must be unused, sealed in original packaging with all included accessories."}
            </li>
            <li>
              {isAr
                ? "إذا وصل المنتج تالفاً أو به عيب مصنعي، نقوم باستبداله فوراً بدون أي رسوم شحن."
                : "If an item arrives damaged or defective, we replace it immediately with zero shipping fees."}
            </li>
            <li>
              {isAr
                ? "يتم استرداد الأموال للطلبات النقدية عبر إنستاباي أو التحويل البنكي خلال 24 ساعة من استلام المنتج المرتجع."
                : "Refunds for cash orders are issued via InstaPay or bank transfer within 24 hours of receiving the returned item."}
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
