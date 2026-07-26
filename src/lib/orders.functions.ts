import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Order handling lives entirely on the server.
 *
 * Before, the browser calculated prices, shipping, the order number and the
 * payment status and then inserted the row itself — anyone could place a
 * 1 EGP order or tamper with stock. Now the browser only sends product ids,
 * quantities and the address; everything that matters is derived server-side
 * from the database.
 *
 * This file is imported by route files, so server-only modules
 * (`client.server`, `admin.server`) are dynamically imported INSIDE handlers.
 */

const EGYPT_PHONE = /^01[0125]\d{8}$/;

const placeOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => EGYPT_PHONE.test(value), "Invalid Egyptian mobile number"),
  email: z.string().trim().email().max(160),
  governorate: z.string().trim().min(2).max(80),
  city: z.string().trim().min(1).max(80),
  street: z.string().trim().min(3).max(300),
  landmark: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["cod", "instapay"]),
  paymentReference: z.string().trim().max(120).optional(),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        qty: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(50),
});

export type PlaceOrderInput = z.input<typeof placeOrderSchema>;

export type PlaceOrderResult = {
  orderNumber: string;
  subtotalEGP: number;
  shippingEGP: number;
  totalEGP: number;
};

const STATUS_VALUES = ["placed", "confirmed", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUS_VALUES = ["pending", "verified", "paid", "failed", "cod"] as const;

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Collapse duplicate lines so a client can't sneak past the per-line cap.
    const requested = new Map<string, number>();
    for (const item of data.items) {
      requested.set(item.id, (requested.get(item.id) ?? 0) + item.qty);
    }
    const ids = [...requested.keys()];

    const { data: rows, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, slug, name, price_egp, image, stock")
      .in("id", ids);

    if (productError) throw productError;

    type Row = {
      id: string;
      slug: string;
      name: string;
      price_egp: number | string;
      image: string;
      stock: number | string;
    };
    const products = (rows ?? []) as unknown as Row[];

    if (products.length !== ids.length) {
      throw new Error("One of the products in your cart is no longer available.");
    }

    let subtotalEGP = 0;
    const orderItems = products.map((product) => {
      const qty = requested.get(product.id)!;
      const stock = Number(product.stock);
      if (stock < qty) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${stock}.`);
      }
      const price = Number(product.price_egp);
      subtotalEGP += price * qty;
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceEGP: price,
        qty,
        image: product.image,
      };
    });

    // Shipping comes from the stored settings row, never from the client.
    const { data: settingsRow } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "store_settings")
      .maybeSingle();

    const settingsValue = (settingsRow?.value ?? {}) as {
      freeShippingThresholdEGP?: unknown;
      defaultShippingFeeEGP?: unknown;
    };
    const freeThreshold = Number(settingsValue.freeShippingThresholdEGP) || 2500;
    const shippingFee = Number(settingsValue.defaultShippingFeeEGP) || 50;
    const shippingEGP = subtotalEGP >= freeThreshold ? 0 : shippingFee;
    const totalEGP = subtotalEGP + shippingEGP;

    // Atomic, race-safe stock decrement (see decrement_product_stock migration).
    const decremented: { id: string; qty: number }[] = [];
    try {
      for (const item of orderItems) {
        const { error } = await supabaseAdmin.rpc("decrement_product_stock" as never, {
          product_id: item.id,
          quantity: item.qty,
        } as never);
        if (error) throw new Error(`Insufficient stock for "${item.name}".`);
        decremented.push({ id: item.id, qty: item.qty });
      }
    } catch (error) {
      // Give the reserved units back if a later line failed.
      for (const item of decremented) {
        await supabaseAdmin.rpc("decrement_product_stock" as never, {
          product_id: item.id,
          quantity: -item.qty,
        } as never);
      }
      throw error;
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const orderNumber = `BDZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentStatus = data.paymentMethod === "cod" ? "cod" : "pending";

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: data.customerName,
      phone: data.phone,
      email: data.email,
      governorate: data.governorate,
      city: data.city,
      street: data.street,
      landmark: data.landmark ?? null,
      items: orderItems,
      subtotal_egp: subtotalEGP,
      shipping_egp: shippingEGP,
      total_egp: totalEGP,
      payment_method: data.paymentMethod,
      payment_status: paymentStatus,
      order_status: "placed",
      payment_reference: data.paymentReference ?? null,
    } as never);

    if (insertError) {
      for (const item of orderItems) {
        await supabaseAdmin.rpc("decrement_product_stock" as never, {
          product_id: item.id,
          quantity: -item.qty,
        } as never);
      }
      throw insertError;
    }

    return { orderNumber, subtotalEGP, shippingEGP, totalEGP };
  });

/* ───────────────────────── Admin-only order access ───────────────────────── */

export const getAdminOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw error;
  return { orders: data ?? [] };
});

export const updateAdminOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        orderStatus: z.enum(STATUS_VALUES),
        paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: Record<string, string> = { order_status: data.orderStatus };
    if (data.paymentStatus) payload.payment_status = data.paymentStatus;

    const { error } = await supabaseAdmin
      .from("orders")
      .update(payload as never)
      .eq("id", data.id);

    if (error) throw error;
    return { ok: true };
  });

export const clearAdminOrders = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("orders")
    .delete({ count: "exact" })
    .neq("id", "");

  if (error) throw error;
  return { ok: true, deletedCount: count ?? 0 };
});
