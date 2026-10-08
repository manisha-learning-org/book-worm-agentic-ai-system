// GET /api/books/new-launches
// Returns up to 5 books marked isNewLaunch=true, ordered by publishedDate desc.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { isNewLaunch: true },
      orderBy: { publishedDate: "desc" },
      take: 5,
    });
    return NextResponse.json({ books });
  } catch (err) {
    console.error("[GET /api/books/new-launches]", err);
    return NextResponse.json({ error: "Failed to fetch new launches" }, { status: 500 });
  }
}
