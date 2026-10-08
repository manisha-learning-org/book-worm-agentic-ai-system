// GET /api/books
// List books with optional filters: q, category, format, lang, price, sort
// Mirrors the filtering logic already in src/app/page.tsx so the UI
// can be wired to this endpoint without any UI changes.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const lang = searchParams.get("lang") ?? "";
  const format = searchParams.get("format") ?? "";
  const price = searchParams.get("price") ?? "";
  const sort = searchParams.get("sort") ?? "";

  // ── Build WHERE clause ────────────────────────────────────────
  const where: Prisma.BookWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
      { category: { contains: q } },
    ];
  }

  if (category && category !== "All") {
    where.category = { equals: category };
  }

  if (lang) {
    where.language = { equals: lang };
  }

  if (format) {
    where.format = { equals: format };
  }

  if (price) {
    if (price === "0-199") where.price = { lte: 199 };
    else if (price === "200-499") where.price = { gte: 200, lte: 499 };
    else if (price === "500-999") where.price = { gte: 500, lte: 999 };
    else if (price === "1000+") where.price = { gte: 1000 };
  }

  // ── Build ORDER BY ─────────────────────────────────────────────
  let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "newest") orderBy = { publishedDate: "desc" };

  try {
    const books = await prisma.book.findMany({ where, orderBy });
    return NextResponse.json({ books });
  } catch (err) {
    console.error("[GET /api/books]", err);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}
