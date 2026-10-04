"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, LogIn, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import { useUserStore } from "@/store/user";
import { mockUser } from "@/lib/mock-data";
import type { User } from "@/lib/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const { isAuthenticated, currentUser, login, logout } = useUserStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in all fields.");
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: "REGISTERED",
        savedAddresses: [],
        giftPointsBalance: 500,
        createdAt: new Date(),
      };
      login(newUser);
      router.push(redirectTo);
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password.");
        return;
      }
      // Log in with existing mock user or entered credentials
      const userToLogin: User = {
        ...mockUser,
        name: email.split("@")[0] || mockUser.name,
        email: email.trim(),
      };
      login(userToLogin);
      router.push(redirectTo);
    }
  };

  const handleQuickDemoLogin = () => {
    login(mockUser);
    router.push(redirectTo);
  };

  if (isAuthenticated && currentUser) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center shadow-xl">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-100">Already Signed In</h2>
        <p className="text-sm text-zinc-400 mt-2">
          You are signed in as <span className="font-semibold text-zinc-200">{currentUser.name}</span> ({currentUser.email}).
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={redirectTo}
            className="w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-sm transition-colors text-center inline-flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              router.push("/logout");
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 text-yellow-400 mb-3">
          {isRegister ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          {isRegister
            ? "Sign up to start purchasing books and earning gift points"
            : "Sign in to access your orders, wishlist, and gift points"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-sm transition-colors shadow-md mt-2 flex items-center justify-center gap-2"
        >
          {isRegister ? "Sign Up" : "Sign In"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900 px-2 text-zinc-500">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleQuickDemoLogin}
        className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium transition-colors mb-4"
      >
        Quick Sign In as Demo User ({mockUser.name.split(" ")[0]})
      </button>

      <div className="text-center text-xs text-zinc-400">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className="text-yellow-400 hover:underline font-medium"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className="text-yellow-400 hover:underline font-medium"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-zinc-100">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
