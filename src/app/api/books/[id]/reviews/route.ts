// GET /api/books/[id]/reviews
// Returns all reviews for a specific book.
//
// POST /api/books/[id]/reviews
// Submit a new review for a book. Requires authentication.
// Body: { rating: number (1–5), comment: string }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const reviews = await prisma.review.findMany({
      where: { bookId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[GET /api/books/[id]/reviews]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rating = Number(body.rating);
  const comment = String(body.comment ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (!comment) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Create review and update book aggregate rating in a transaction
    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: {
          bookId,
          userId: user.id,
          userName: user.name,
          rating,
          comment,
        },
      }),
    ]);

    // Recalculate aggregate rating
    const agg = await prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: {
        rating: agg._avg.rating ?? rating,
        reviewCount: agg._count.rating,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/books/[id]/reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
