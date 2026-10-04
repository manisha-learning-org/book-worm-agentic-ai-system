import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as INR currency  e.g.  ₹1,299 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Calculate tax at 5% */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * 0.05);
}

/** Free delivery above ₹499, else ₹49 */
export function calculateDeliveryCharge(subtotal: number): number {
  return subtotal >= 499 ? 0 : 49;
}
