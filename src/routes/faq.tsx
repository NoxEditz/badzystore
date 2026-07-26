import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { OrderWhatsAppLink } from "@/components/site/OrderWhatsAppLink";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Badzy Store" },
      { name: "description", content: "Learn about payment options, delivery times, and warranty at Badzy Store Egypt." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const isAr = lang === "ar";

  const faqs = [
    {
      q: isAr ? "ما هي طرق الدفع المتاحة لدى بادزي ستور؟" : "What payment methods are available?",
      a:
        isAr
          ? "نوفر طريقة الدفع عند الاستلام (COD) كخيار رئيسي وافتراضي لكل المحافظات، بالإضافة إلى الدفع والتحويل البنكي عبر إنستاباي (InstaPay)."
          : "We offer Cash on Delivery (COD) as our primary method across Egypt, as well as Bank Transfers via InstaPay.",
    },
    {
      q: isAr ? "كم تستغرق مدة التوصيل داخل مصر؟" : "How long does shipping take in Egypt?",
      a:
        isAr
          ? "التوصيل يستغرق 1–2 يوم عمل في الإسكندرية والقاهرة والجيزة، ومن 3–5 أيام عمل لباقي المحافظات."
          : "Delivery takes 1–2 business days for Alexandria, Cairo & Giza, and 3–5 business days for all other governorates.",
    },
    {
      q: isAr ? "هل المنتجات مشمولة بضمان رسمي؟" : "Are products covered under warranty?",
      a:
        isAr
          ? "نعم، جميع منتجات بادزي ستور تأتي بضمان لمدة عام كامل ضد عيوب التصنيع."
          : "Yes, every product from Badzy Store comes with a 1-Year limited warranty against manufacturing defects.",
    },
    {
      q: isAr ? "كيف يمكنني استرجاع أو استبدال منتج؟" : "How can I return or exchange a product?",
      a:
        isAr
          ? "يمكنك الاسترجاع أو الاستبدال خلال 14 يوماً من استلام الشحنة بشرط أن يكون المنتج بحالته الأصلية وغلافه. تواصل معنا عبر واتساب لبدء الطلب."
          : "You can return or exchange any unopen/original condition product within 14 days of receipt. Contact support on WhatsApp to initiate.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.nav.faq}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAr ? "كل ما تحتاج معرفته عن التسوق معنا." : "Everything you need to know about shopping with us."}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-primary/40 bg-primary/10 p-8 text-center space-y-4">
        <h3 className="font-display text-xl font-bold text-foreground">
          {isAr ? "هل ما زال لديك أسئلة؟" : "Still have questions?"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isAr
            ? "فريقنا متواجد على مدار الساعة عبر واتساب لمساعدتك في اختيار أفضل معدات القيمنق."
            : "Our team is available 24/7 on WhatsApp to help you choose the best gaming gear."}
        </p>
        <OrderWhatsAppLink className="h-11 px-6" />
      </div>
    </div>
  );
}
