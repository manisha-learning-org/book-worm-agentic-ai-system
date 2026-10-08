// GET /api/books/bestsellers
// Returns up to 5 books marked isBestseller=true, ordered by copiesSold desc.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { isBestseller: true },
      orderBy: { copiesSold: "desc" },
      take: 5,
    });
    return NextResponse.json({ books });
  } catch (err) {
    console.error("[GET /api/books/bestsellers]", err);
    return NextResponse.json({ error: "Failed to fetch bestsellers" }, { status: 500 });
  }
}
