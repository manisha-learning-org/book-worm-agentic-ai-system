"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

const OrderConfirmationClient = dynamic(
  () => import("@/components/order-confirmation/OrderConfirmationClient"),
  { ssr: false }
);

export default function OrderConfirmationPage() {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <OrderConfirmationClient />
    </>
  );
}
