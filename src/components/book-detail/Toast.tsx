"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl text-sm text-zinc-100 transition-all duration-300",
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
