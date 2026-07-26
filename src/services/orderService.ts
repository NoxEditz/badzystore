import { placeOrder, type PlaceOrderResult } from "@/lib/orders.functions";

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
  paymentMethod: "cod" | "instapay";
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

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  street: string;
  landmark?: string | null;
  items?: OrderItem[] | null;
  subtotal_egp: number | string;
  shipping_egp: number | string;
  total_egp: number | string;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_reference?: string | null;
  created_at: string;
};

export function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    governorate: row.governorate,
    city: row.city,
    street: row.street,
    landmark: row.landmark ?? undefined,
    items: row.items ?? [],
    subtotalEGP: Number(row.subtotal_egp),
    shippingEGP: Number(row.shipping_egp),
    totalEGP: Number(row.total_egp),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    paymentReference: row.payment_reference ?? undefined,
    createdAt: row.created_at,
  };
}

/**
 * Places an order. All pricing, stock and status logic runs server-side in
 * `placeOrder`; the browser only receives the confirmation numbers.
 */
export async function createOrder(payload: OrderPayload): Promise<PlaceOrderResult> {
  return placeOrder({ data: payload });
}
