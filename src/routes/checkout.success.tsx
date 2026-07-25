import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { OrderWhatsAppLink } from "@/components/site/OrderWhatsAppLink";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Badzy Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const search = useSearch({ from: "/checkout/success" }) as { order?: string };
  const orderNumber = search?.order || "BDZ-100000";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.success.title}</h1>
      <p className="mt-2 text-sm font-semibold text-primary font-mono">
        {t.success.orderNumber}: #{orderNumber}
      </p>

      <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
        {t.success.thankYou}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <OrderWhatsAppLink orderNumber={orderNumber} className="flex-1 h-12" />

        <Link
          to="/"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-secondary transition"
        >
          {t.success.backHome}
          <ArrowRight className="h-4 w-4 ltr:inline rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}