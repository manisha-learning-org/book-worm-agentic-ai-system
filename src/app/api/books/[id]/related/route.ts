// GET /api/books/[id]/related
// Returns up to 4 books in the same category, excluding the current book.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      select: { category: true },
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const related = await prisma.book.findMany({
      where: { category: book.category, id: { not: id } },
      take: 4,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ books: related });
  } catch (err) {
    console.error("[GET /api/books/[id]/related]", err);
    return NextResponse.json({ error: "Failed to fetch related books" }, { status: 500 });
  }
}
