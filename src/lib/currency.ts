/**
 * EGP Currency Utility
 * Centralized formatting for Egyptian Pounds.
 * Egyptian retail e-commerce uses Western digits with "EGP" or "ج.م" without decimal piasters.
 */

export function formatEGP(amount: number, locale: "en" | "ar" = "en"): string {
  const rounded = Math.round(amount);
  const formattedNumber = new Intl.NumberFormat("en-US").format(rounded);

  if (locale === "ar") {
    return `${formattedNumber} ج.م`;
  }
  return `${formattedNumber} EGP`;
}
