// PATCH /api/orders/[id]/cancel
// Cancel an order that is still within the 48-hour cancellation window.
// Refunds gift-points discount back to the user's balance if the order
// used gift points.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (order.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: `Order cannot be cancelled (current status: ${order.status})` },
        { status: 400 }
      );
    }
    if (new Date() > order.canCancelUntil) {
      return NextResponse.json(
        { error: "Cancellation window has expired" },
        { status: 400 }
      );
    }

    // Cancel in a transaction; refund gift points if applicable
    const [cancelled] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { items: { include: { book: true } }, address: true },
      }),
      // Refund gift-points discount (the discount field stores the total
      // discount which includes both coupon + gift points; we only refund
      // when paymentMethod includes "Gift Points").
      ...(order.paymentMethod === "Gift Points"
        ? [
            prisma.user.update({
              where: { id: user.id },
              data: { giftPointsBalance: { increment: order.discount } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ order: cancelled });
  } catch (err) {
    console.error("[PATCH /api/orders/[id]/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
