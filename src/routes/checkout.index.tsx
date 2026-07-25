import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Lock, Smartphone, Banknote, ShieldCheck, CheckCircle2, QrCode } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { createOrder } from "@/services/orderService";
import { getStoreSettings } from "@/services/settingsService";
import { getPaymentProvider } from "@/services/paymentService";
import { formatEGP } from "@/lib/currency";
import { useLang } from "@/store/lang";
import { DICTIONARY } from "@/lib/i18n";
import { toast } from "sonner";
import { CONFIG } from "@/lib/config";

export const EGYPT_GOVERNORATES = [
  "Alexandria",
  "Cairo",
  "Giza",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Gharbia",
  "Dakahlia",
  "Sharqia",
  "Monufia",
  "Beheira",
  "Ismailia",
  "Beni Suef",
  "Faiyum",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
  "Damietta",
];

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Checkout — Badzy Store Egypt" },
      { name: "description", content: "Complete your Badzy Store order with Cash on Delivery or Vodafone Cash." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lang } = useLang();
  const t = DICTIONARY[lang];
  const settings = getStoreSettings();

  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const nav = useNavigate();

  const subtotal = cartSubtotal(lines);
  const freeThreshold = CONFIG.freeShippingThresholdEGP;
  const shipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : CONFIG.defaultShippingFeeEGP;
  const total = subtotal + shipping;

  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "instapay">("cod");

  // Form Fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0]);
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Egyptian Phone Validation: 010, 011, 012, 015 + 8 digits
  const validateEgyptianPhone = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    return /^01[0125]\d{8}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEgyptianPhone(phone)) {
      toast.error(
        lang === "ar"
          ? "يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)"
          : "Please enter a valid Egyptian mobile number (e.g. 01012345678)",
      );
      return;
    }

    if (paymentMethod === "instapay" && (!paymentRef || paymentRef.trim().length < 3)) {
      toast.error(
        lang === "ar"
          ? "يرجى إدخال رقم مرجع التحويل أو معرّف إنستاباي الخاص بك"
          : "Please enter your transfer reference ID or InstaPay handle",
      );
      return;
    }

    setSubmitting(true);

    try {
      // Process through payment provider abstraction
      const provider = getPaymentProvider(paymentMethod);
      const payRes = await provider.processPayment({
        orderId: `temp_${Date.now()}`,
        amountEGP: total,
        customerName: fullName,
        email,
        phone,
        referenceId: paymentRef,
        cardDetails: { number: cardNumber, exp: cardExp, cvc: cardCvc },
      });

      if (!payRes.success) {
        toast.error(payRes.message);
        setSubmitting(false);
        return;
      }

      // Create order via orderService (validates stock & calculates prices)
      const order = await createOrder({
        customerName: fullName,
        phone,
        email,
        governorate,
        city,
        street,
        landmark,
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        paymentMethod,
        paymentReference: paymentRef || payRes.transactionId,
      });

      clear();
      toast.success(payRes.message);
      nav({ to: "/checkout/success", search: { order: order.orderNumber } });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">{t.cart.empty}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add items to your cart before checking out.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-bold">{t.checkout.title}</h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Contact Section */}
          <Section title={t.checkout.contact}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t.checkout.email}
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                label={t.checkout.phone}
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="01012345678"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </Section>

          {/* Shipping Address */}
          <Section title={t.checkout.shippingAddress}>
            <Field
              label={t.checkout.fullName}
              name="fn"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t.checkout.governorate}
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                >
                  {EGYPT_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label={t.checkout.city}
                name="city"
                placeholder="e.g. Smouha, Nasr City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Field
              label={t.checkout.street}
              name="street"
              placeholder="Building No., Street Name"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />

            <Field
              label={t.checkout.landmark}
              name="landmark"
              placeholder="Near hospital, school, landmark..."
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </Section>

          {/* Payment Method Section */}
          <Section
            title={t.checkout.paymentMethod}
            hint={
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <Lock className="h-3 w-3" /> {t.checkout.secure}
              </span>
            }
          >
            <div className="space-y-3">
              {/* Option 1: COD (Default) */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-400" />
                      {t.checkout.cod}
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.checkout.codDesc}</p>
                </div>
              </label>

              {/* Option 2: Instapay */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  paymentMethod === "instapay"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="instapay"
                  checked={paymentMethod === "instapay"}
                  onChange={() => setPaymentMethod("instapay")}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    {lang === "ar" ? "إنستاباي / تحويل بنكي" : "InstaPay / Bank Transfer"}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lang === "ar" 
                      ? "قم بتحويل المبلغ عبر إنستاباي، ثم أدخل رقم المرجع أو المعرّف الخاص بك."
                      : "Transfer the amount via InstaPay, then enter your transaction reference."}
                  </p>

                  {paymentMethod === "instapay" && (
                    <div className="mt-4 rounded-md border border-border bg-background p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono bg-card p-2.5 rounded border border-border">
                        <span>{t.checkout.instapayLabel}</span>
                        <strong className="text-primary text-sm">{settings.instapayHandle}</strong>
                      </div>
                      <Field
                        label={lang === "ar" ? "رقم المرجع / معرّف إنستاباي الخاص بك" : "Transaction Reference / Your InstaPay Handle"}
                        name="ref"
                        placeholder={lang === "ar" ? "أدخل رقم المرجع..." : "Enter reference..."}
                        required
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </Section>
        </div>

        {/* Order Summary Aside */}
        <aside className="h-fit rounded-lg border border-border/60 bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">{t.checkout.summary}</h2>
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-3 text-sm">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border/60 bg-black">
                  <img src={l.image} alt="" width={56} height={56} className="h-full w-full object-cover" />
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {l.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 font-medium text-xs">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{formatEGP(l.price, lang)}</div>
                </div>
                <div className="text-sm font-semibold font-display">{formatEGP(l.price * l.qty, lang)}</div>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm border-t border-border/60 pt-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.checkout.subtotal}</dt>
              <dd className="font-display font-medium">{formatEGP(subtotal, lang)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.checkout.shippingFee}</dt>
              <dd className="font-display font-medium">{shipping === 0 ? t.checkout.free : formatEGP(shipping, lang)}</dd>
            </div>
            <div className="my-2 border-t border-border/60" />
            <div className="flex justify-between text-base font-semibold">
              <dt>{t.checkout.total}</dt>
              <dd className="font-display text-xl font-bold text-primary">{formatEGP(total, lang)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex h-12 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-70 shadow-lg"
          >
            {submitting ? "Processing Order…" : `${t.checkout.placeOrder} · ${formatEGP(total, lang)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {hint}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-primary ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </label>
  );
}