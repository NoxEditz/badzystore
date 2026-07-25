import { getProducts, updateProductStock } from "./productService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CONFIG } from "@/lib/config";

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "verified" | "paid" | "failed" | "cod";

export type OrderItem = {
  id: string;
  slug: string;
  name: string;
  priceEGP: number;
  qty: number;
  image: string;
};

export type OrderPayload = {
  customerName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  street: string;
  landmark?: string;
  items: { id: string; qty: number }[];
  paymentMethod: "cod" | "vodafone_cash" | "instapay" | "fawry" | "card";
  paymentReference?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  street: string;
  landmark?: string;
  items: OrderItem[];
  subtotalEGP: number;
  shippingEGP: number;
  totalEGP: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference?: string;
  createdAt: string;
};

const LOCAL_ORDERS_KEY = "badzy_store_orders";

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  }
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  const allProducts = await getProducts();
  const orderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  // Verify stock & calculate server-side pricing
  for (const item of payload.items) {
    const product = allProducts.find((p) => p.id === item.id);
    if (!product) {
      throw new Error(`Product with ID ${item.id} not found.`);
    }
    if (product.stock < item.qty) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.qty}`,
      );
    }
    const itemTotal = product.price * item.qty;
    calculatedSubtotal += itemTotal;

    orderItems.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceEGP: product.price,
      qty: item.qty,
      image: product.image,
    });
  }

  // Calculate shipping fee according to free shipping threshold
  const shippingEGP =
    calculatedSubtotal >= CONFIG.freeShippingThresholdEGP || calculatedSubtotal === 0
      ? 0
      : CONFIG.defaultShippingFeeEGP;
  const totalEGP = calculatedSubtotal + shippingEGP;

  // Atomically decrement stock
  for (const item of payload.items) {
    const product = allProducts.find((p) => p.id === item.id)!;
    await updateProductStock(product.id, product.stock - item.qty);
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const orderNumber = `BDZ-${Math.floor(100000 + Math.random() * 900000)}`;

  let initialPaymentStatus: PaymentStatus = "pending";
  if (payload.paymentMethod === "cod") {
    initialPaymentStatus = "cod";
  }

  const order: Order = {
    id: orderId,
    orderNumber,
    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,
    governorate: payload.governorate,
    city: payload.city,
    street: payload.street,
    landmark: payload.landmark,
    items: orderItems,
    subtotalEGP: calculatedSubtotal,
    shippingEGP,
    totalEGP,
    paymentMethod: payload.paymentMethod,
    paymentStatus: initialPaymentStatus,
    orderStatus: "placed",
    paymentReference: payload.paymentReference,
    createdAt: new Date().toISOString(),
  };

  // Save to local storage
  const orders = getLocalOrders();
  orders.unshift(order);
  saveLocalOrders(orders);

  // Save to Supabase if available
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("orders").insert({
        id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        phone: order.phone,
        email: order.email,
        governorate: order.governorate,
        city: order.city,
        street: order.street,
        landmark: order.landmark,
        items: order.items,
        subtotal_egp: order.subtotalEGP,
        shipping_egp: order.shippingEGP,
        total_egp: order.totalEGP,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        order_status: order.orderStatus,
        payment_reference: order.paymentReference,
        created_at: order.createdAt,
      });
    } catch (e) {
      console.error("Supabase order insert error:", e);
    }
  }

  return order;
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          customerName: o.customer_name,
          phone: o.phone,
          email: o.email,
          governorate: o.governorate,
          city: o.city,
          street: o.street,
          landmark: o.landmark,
          items: o.items || [],
          subtotalEGP: Number(o.subtotal_egp),
          shippingEGP: Number(o.shipping_egp),
          totalEGP: Number(o.total_egp),
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status as PaymentStatus,
          orderStatus: o.order_status as OrderStatus,
          paymentReference: o.payment_reference,
          createdAt: o.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch orders error:", e);
    }
  }
  return getLocalOrders();
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus,
): Promise<boolean> {
  const orders = getLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    orders[index].orderStatus = orderStatus;
    if (paymentStatus) {
      orders[index].paymentStatus = paymentStatus;
    }
    saveLocalOrders(orders);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = { order_status: orderStatus };
      if (paymentStatus) payload.payment_status = paymentStatus;
      await supabase.from("orders").update(payload).eq("id", orderId);
    } catch (e) {
      console.error("Supabase update order status error:", e);
    }
  }
  return true;
}
