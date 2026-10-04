"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

const WishlistClient = dynamic(
  () => import("@/components/wishlist/WishlistClient"),
  { ssr: false }
);

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-zinc-100">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        <WishlistClient />
      </main>
    </div>
  );
}
