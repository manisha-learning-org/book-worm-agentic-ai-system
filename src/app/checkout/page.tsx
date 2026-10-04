"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

/**
 * CheckoutClient is loaded with ssr:false because it reads from
 * Zustand stores backed by localStorage — server-rendering would
 * always show an empty-cart flash before hydration.
 *
 * Two-step checkout flow implemented in CheckoutClient:
 *   1. Address form with inline validation  →  opens PaymentModal
 *   2. PaymentModal (method select + simulated processing)
 *      →  on success calls handlePaymentSuccess(method)
 *   3. handlePaymentSuccess snapshots cart, builds Order,
 *      persists via useOrdersStore, clears cart,
 *      then opens PurchaseSuccessModal
 *   4. PurchaseSuccessModal "Continue your Shopping" → router.push("/")
 */
const CheckoutClient = dynamic(
  () => import("@/components/checkout/CheckoutClient"),
  { ssr: false }
);

export default function CheckoutPage() {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <CheckoutClient />
    </>
  );
}
