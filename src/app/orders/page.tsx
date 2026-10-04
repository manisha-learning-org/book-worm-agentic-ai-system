"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

const OrdersClient = dynamic(
  () => import("@/components/orders/OrdersClient"),
  { ssr: false }
);

export default function OrdersPage() {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <OrdersClient />
    </>
  );
}
