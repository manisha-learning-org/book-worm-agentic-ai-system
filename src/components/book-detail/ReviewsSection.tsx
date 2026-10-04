"use client";

import { useState } from "react";
import { User as UserIcon, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import type { Review } from "@/lib/types";
import { StarRating } from "./StarRating";

interface ReviewsSectionProps {
  initialReviews: Review[];
  bookId: string;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ReviewsSection({ initialReviews, bookId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);

    const review: Review = {
      id: `rev-local-${Date.now()}`,
      bookId,
      userId: "guest",
      userName: newName.trim() || "Anonymous",
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date(),
    };

    setReviews((r) => [review, ...r]);
    setNewRating(0);
    setNewComment("");
    setNewName("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-yellow-400" />
        Reviews
        <span className="text-sm font-normal text-zinc-500">({reviews.length})</span>
      </h2>

      {/* ── Submit form ── */}
      <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-5 mb-8">
        <h3 className="text-base font-semibold text-zinc-200 mb-4">Write a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="review-name" className="block text-sm text-zinc-400 mb-1.5">
              Your Name
            </label>
            <input
              id="review-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Priya S."
              maxLength={60}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition"
            />
          </div>

          {/* Star rating */}
          <div>
            <p className="text-sm text-zinc-400 mb-1.5">Your Rating</p>
            <StarRating value={newRating} onChange={setNewRating} size="lg" />
            {ratingError && (
              <p className="text-xs text-red-400 mt-1">Please select a star rating.</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="review-comment" className="block text-sm text-zinc-400 mb-1.5">
              Your Review
            </label>
            <textarea
              id="review-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this book…"
              rows={4}
              maxLength={1000}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-yellow-400 text-zinc-900 hover:bg-yellow-300 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              Submit Review
            </button>
            {submitted && (
              <span className="text-sm text-green-400">Review posted!</span>
            )}
          </div>
        </form>
      </div>

      {/* ── Review list ── */}
      {reviews.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const isExpanded = expanded.has(review.id);
            const longComment = review.comment.length > 180;
            const displayComment =
              longComment && !isExpanded
                ? review.comment.slice(0, 180) + "…"
                : review.comment;

            return (
              <li
                key={review.id}
                className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {review.userName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarRating value={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <div className="mt-3">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {displayComment}
                    </p>
                    {longComment && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                        className="flex items-center gap-1 mt-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
