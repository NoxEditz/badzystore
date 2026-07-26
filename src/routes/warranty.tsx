import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useLang } from "@/store/lang";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Warranty Policy — Badzy Store" },
      { name: "description", content: "Official 1-year product warranty coverage at Badzy Store Egypt." },
    ],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {isAr ? "ضمان حماية لمدة سنة كاملة" : "1-Year Warranty Protection"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAr ? "كل ماوس وكيبورد وسماعة وإكسسوار مضمون من بادزي." : "Every mouse, keyboard, headset & accessory is backed by Badzy."}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            {isAr ? "ما الذي يشمله الضمان؟" : "What's Covered?"}
          </h2>
          <p>
            {isAr
              ? "يغطي ضمان السنة الكاملة جميع عيوب التصنيع الداخلية، وأعطال السنسور، ومشاكل الضغط المزدوج في المفاتيح، وأعطال اتصال الدونجل اللاسلكي، وأعطال وحدة التحكم في الإضاءة."
              : "Our 1-year warranty covers all internal manufacturing defects, sensor malfunctions, switch double-clicking issues, wireless dongle connection failures, and LED controller faults."}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            {isAr ? "كيفية تقديم طلب ضمان" : "How to File a Warranty Claim"}
          </h2>
          <p>
            {isAr
              ? "تواصل مع فريق الدعم عبر واتساب مع رقم الطلب أو رقم هاتفك، مع فيديو قصير يوضح المشكلة. سيقوم فريقنا بترتيب استلام مجاني عن طريق الشركة للفحص والاستبدال."
              : "Simply reach out to our WhatsApp support line with your order number or phone number, along with a short video demonstrating the issue. Our team will arrange a free courier pick-up for inspection and replacement."}
          </p>
        </div>
      </div>
    </div>
  );
}
