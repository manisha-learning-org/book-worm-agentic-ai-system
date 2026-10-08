// GET   /api/orders/[id]           — single order detail
// PATCH /api/orders/[id]/cancel   — cancel an order (within 48-hour window)
//
// Both routes are implemented in separate files; this file handles GET.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } }, address: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("[GET /api/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
