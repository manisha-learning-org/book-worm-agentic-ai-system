"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

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
