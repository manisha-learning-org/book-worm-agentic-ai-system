"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export interface BookCoverProps {
  src?: string | null;
  title: string;
  author: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: string;
}

export function BookCover({
  src,
  title,
  author,
  className = "w-full h-full object-cover",
  width = 240,
  height = 360,
  priority = false,
  aspectRatio = "aspect-[2/3]",
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback UI if image URL is invalid, empty, or fails to load
  if (imageError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-between p-4 text-center bg-zinc-900/90 border border-zinc-800 rounded-md select-none text-zinc-300 shadow-inner ${aspectRatio}`}
        role="img"
        aria-label={`Cover placeholder for ${title} by ${author}`}
      >
        <div className="w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400 mt-2">
          <BookOpen className="w-5 h-5 text-amber-500/80" />
        </div>
        <div className="my-auto px-1">
          <p className="text-xs font-semibold text-zinc-100 line-clamp-3 leading-snug">
            {title}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-1">
            by {author}
          </p>
        </div>
        <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">
          Book Worm
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-zinc-900 border border-zinc-800/80 shadow-md group ${aspectRatio}`}
    >
      {/* Loading shimmer indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-800/50 animate-pulse z-0" />
      )}

      <Image
        src={src}
        alt={`Cover of ${title} by ${author}`}
        width={width}
        height={height}
        priority={priority}
        unoptimized={true}
        onLoad={() => setIsLoading(false)}
        onError={() => setImageError(true)}
        className={`${className} transition-transform duration-300 ease-out group-hover:scale-105 z-10`}
      />
    </div>
  );
}

export default BookCover;
