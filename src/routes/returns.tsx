import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useLang } from "@/store/lang";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RotateCcw className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Shipping & Returns Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Clear, honest policies designed for Egyptian shoppers.</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> 1. Shipping Nationwide in Egypt
          </h2>
          <p>
            We ship to all 27 Egyptian governorates. Orders placed before 3 PM Cairo time are dispatched on the same business day.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Alexandria & Cairo / Giza:</strong> 1–2 Business Days</li>
            <li><strong>Delta & Canal Governorates:</strong> 2–3 Business Days</li>
            <li><strong>Upper Egypt & Coastal Governorates:</strong> 3–5 Business Days</li>
            <li><strong>Free Shipping:</strong> Automatically applied on all orders exceeding 2,500 EGP.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" /> 2. 14-Day Easy Return Policy
          </h2>
          <p>
            Under Egyptian Consumer Protection regulations, you have 14 days from the date of delivery to return or exchange any item.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Item must be unused, sealed in original packaging with all included accessories.</li>
            <li>If an item arrives damaged or defective, we replace it immediately with zero shipping fees.</li>
            <li>Refunds for cash orders are issued via InstaPay or bank transfer within 24 hours of receiving the returned item.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
