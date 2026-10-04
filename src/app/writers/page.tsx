"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

const WritersClient = dynamic(
  () => import("@/components/writers/WritersClient"),
  { ssr: false }
);

export default function WritersPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-zinc-100">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        <WritersClient />
      </main>
    </div>
  );
}
