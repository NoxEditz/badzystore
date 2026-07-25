/**
 * Payment Provider Abstraction Layer.
 *
 * Only real, integrated payment methods are exposed here. Card (Paymob/Stripe)
 * and Fawry are intentionally NOT provided until a real gateway integration
 * is in place — rendering a card form or generating a fake Fawry code from
 * the browser was misleading and never actually collected money.
 */

export interface PaymentRequest {
  orderId: string;
  amountEGP: number;
  customerName: string;
  email: string;
  phone: string;
  referenceId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: "completed" | "pending_verification" | "failed";
  message: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}

// 1. Cash on Delivery
export const CodPaymentProvider: PaymentProvider = {
  id: "cod",
  name: "Cash on Delivery",
  async processPayment(req) {
    return {
      success: true,
      transactionId: `COD-${req.orderId}`,
      status: "completed",
      message: "Order placed via Cash on Delivery. Payment will be collected upon arrival.",
    };
  },
};

// 2. InstaPay / bank transfer (manual verification)
export const MobileWalletPaymentProvider: PaymentProvider = {
  id: "instapay",
  name: "InstaPay / Bank Transfer",
  async processPayment(req) {
    if (!req.referenceId || req.referenceId.trim().length < 3) {
      return {
        success: false,
        status: "failed",
        message: "Please enter your transaction reference number or sender mobile number.",
      };
    }
    return {
      success: true,
      transactionId: req.referenceId,
      status: "pending_verification",
      message: "Payment reference submitted! Your payment will be verified shortly.",
    };
  },
};

export function getPaymentProvider(methodId: string): PaymentProvider {
  switch (methodId) {
    case "instapay":
      return MobileWalletPaymentProvider;
    case "cod":
    default:
      return CodPaymentProvider;
  }
}
