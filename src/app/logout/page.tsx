"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle, ArrowRight, Home, LogIn } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import { useUserStore } from "@/store/user";

function LogoutContent() {
  const router = useRouter();
  const { logout, isAuthenticated } = useUserStore();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Perform logout when navigating to logout page
    logout();
  }, [logout]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center shadow-xl">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 mb-4">
        <LogOut className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-zinc-100 mb-2">
        You&apos;ve Been Signed Out
      </h1>
      <p className="text-sm text-zinc-400 mb-6">
        Thank you for visiting Book Worm. You have successfully signed out of your account.
      </p>

      <div className="mb-6 p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-xs text-zinc-400">
        Redirecting to home page in <span className="font-bold text-yellow-400">{countdown}s</span>...
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
        <Link
          href="/login"
          className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Sign In Again
        </Link>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-zinc-100">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
          <LogoutContent />
        </Suspense>
      </main>
    </div>
  );
}
