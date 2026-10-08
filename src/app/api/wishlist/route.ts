// GET  /api/wishlist — list all wishlist items for current user
// POST /api/wishlist — add a book to the wishlist
//                     Body: { bookId: string }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { bookId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bookId = String(body.bookId ?? "").trim();
  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // upsert so clicking the heart twice doesn't error
    const item = await prisma.wishlistItem.upsert({
      where: { userId_bookId: { userId: user.id, bookId } },
      update: {},
      create: { userId: user.id, bookId },
      include: { book: true },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}
