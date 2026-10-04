"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Current value (0-5) */
  value: number;
  /** If provided, the stars become interactive */
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const interactive = !!onChange;
  const iconSize = SIZE_MAP[size];

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const halfFilled = !filled && star - 0.5 <= value;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            aria-label={interactive ? `Rate ${star} star${star > 1 ? "s" : ""}` : undefined}
            className={cn(
              "transition-transform",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default pointer-events-none"
            )}
          >
            <Star
              className={cn(
                iconSize,
                filled || halfFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-zinc-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
