// GET /api/books/[id]
// Single book detail — includes all fields needed for the detail page.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ book });
  } catch (err) {
    console.error("[GET /api/books/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}
