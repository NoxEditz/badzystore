/**
 * Payment Provider Abstraction Layer
 * Allows dropping in Paymob, Fawry, Stripe, or local Egyptian payment gateways
 * without modifying checkout UI logic.
 */

export interface PaymentRequest {
  orderId: string;
  amountEGP: number;
  customerName: string;
  email: string;
  phone: string;
  cardDetails?: {
    number: string;
    exp: string;
    cvc: string;
  };
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

// 1. Cash on Delivery Adapter
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

// 2. Vodafone Cash / Mobile Wallet Adapter
export const MobileWalletPaymentProvider: PaymentProvider = {
  id: "vodafone_cash",
  name: "Vodafone Cash / InstaPay",
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

// 3. Fawry Gateway Adapter (Stub)
export const FawryPaymentProvider: PaymentProvider = {
  id: "fawry",
  name: "Fawry Pay",
  async processPayment(req) {
    const fawryCode = Math.floor(900000000 + Math.random() * 100000000).toString();
    return {
      success: true,
      transactionId: fawryCode,
      status: "pending_verification",
      message: `Fawry payment code generated: ${fawryCode}. Please pay at any Fawry kiosk.`,
    };
  },
};

// 4. Card Payment Adapter (Paymob / Stripe Integration Gateway Stub)
export const CardPaymentProvider: PaymentProvider = {
  id: "card",
  name: "Credit / Debit Card (Paymob / Stripe)",
  async processPayment(req) {
    if (!req.cardDetails || !req.cardDetails.number) {
      return {
        success: false,
        status: "failed",
        message: "Invalid card details provided.",
      };
    }
    // Simulate Paymob gateway API response
    return {
      success: true,
      transactionId: `PAYMOB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: "completed",
      message: "Card payment processed successfully via Paymob gateway.",
    };
  },
};

export function getPaymentProvider(methodId: string): PaymentProvider {
  switch (methodId) {
    case "vodafone_cash":
    case "instapay":
      return MobileWalletPaymentProvider;
    case "fawry":
      return FawryPaymentProvider;
    case "card":
      return CardPaymentProvider;
    case "cod":
    default:
      return CodPaymentProvider;
  }
}
