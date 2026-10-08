// GET /api/books/recommended
// Returns up to 5 highest-rated books (proxy for "Recommended for You").

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { rating: "desc" },
      take: 5,
    });
    return NextResponse.json({ books });
  } catch (err) {
    console.error("[GET /api/books/recommended]", err);
    return NextResponse.json({ error: "Failed to fetch recommended books" }, { status: 500 });
  }
}
