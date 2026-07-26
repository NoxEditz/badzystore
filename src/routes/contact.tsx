import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, MapPin, Mail } from "lucide-react";
import { OrderWhatsAppLink } from "@/components/site/OrderWhatsAppLink";
import {
  fetchStoreSettings,
  getStoreSettings,
  subscribeToStoreSettings,
  type StoreSettings,
} from "@/services/settingsService";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Badzy Store" },
      { name: "description", content: "Get in touch with Badzy Store support via WhatsApp or Phone." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
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

  useEffect(() => subscribeToStoreSettings(setSettings), []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageCircle className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Contact Badzy Store</h1>
        <p className="mt-2 text-sm text-muted-foreground">We're here to help you upgrade your gaming setup.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Fastest Support</h2>
          <p className="text-sm text-muted-foreground">
            WhatsApp is the quickest way to reach our support team for order inquiries, delivery coordination, or stock questions.
          </p>
          <OrderWhatsAppLink className="w-full h-11" />
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4 text-sm">
          <h2 className="font-display text-xl font-bold">Store Details</h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span>WhatsApp / Phone: +20 {settings.whatsappNumber.slice(2)}</span>
            </div>
            {settings.supportEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email: {settings.supportEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Alexandria & Cairo, Egypt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
