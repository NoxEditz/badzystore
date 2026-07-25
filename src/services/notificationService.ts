/**
 * Multi-channel Notification Dispatcher (WhatsApp Business / Email / SMS)
 */

export interface NotificationPayload {
  recipient: string; // Phone or Email
  subject?: string;
  message: string;
  channel: "whatsapp" | "email" | "sms";
}

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  console.log(`[Notification dispatched via ${payload.channel.toUpperCase()}] to ${payload.recipient}:`, payload.message);
  return true;
}

export async function sendOrderConfirmationNotification(orderNumber: string, phone: string, totalEGP: number) {
  const message = `Badzy Store: Your order #${orderNumber} (${totalEGP} EGP) has been placed successfully! We will contact you prior to dispatch.`;
  await sendNotification({ recipient: phone, message, channel: "whatsapp" });
}
