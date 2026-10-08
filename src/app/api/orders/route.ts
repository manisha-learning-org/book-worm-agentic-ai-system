// POST /api/orders  — place a new order
// GET  /api/orders  — list all orders for the current user
//
// POST body:
// {
//   items: Array<{ bookId, quantity, selectedFormat, priceAtAdd }>,
//   address: { label, fullName, phone, line1, line2?, city, state, pincode, country? },
//   paymentMethod: string,
//   couponCode?: string,        // optional – applied if valid
//   useGiftPoints?: boolean     // optional – deducts up to balance
// }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { calculateTax, calculateDeliveryCharge } from "@/lib/utils";

const GIFT_POINTS_VALUE = 1; // 1 point = ₹1 discount

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawItems = body.items as Array<{
    bookId: string;
    quantity: number;
    selectedFormat: string;
    priceAtAdd: number;
  }>;
  const rawAddress = body.address as Record<string, string> | undefined;
  const paymentMethod = String(body.paymentMethod ?? "").trim();
  const couponCode = body.couponCode ? String(body.couponCode).trim().toUpperCase() : null;
  const useGiftPoints = Boolean(body.useGiftPoints);

  if (!rawItems || rawItems.length === 0) {
    return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
  }
  if (!rawAddress || !rawAddress.fullName || !rawAddress.line1 || !rawAddress.city) {
    return NextResponse.json({ error: "A valid delivery address is required" }, { status: 400 });
  }
  if (!paymentMethod) {
    return NextResponse.json({ error: "paymentMethod is required" }, { status: 400 });
  }

  try {
    // ── Validate books exist and build subtotal ────────────────
    const bookIds = rawItems.map((i) => i.bookId);
    const books = await prisma.book.findMany({ where: { id: { in: bookIds } } });
    const bookMap = new Map(books.map((b) => [b.id, b]));

    for (const item of rawItems) {
      if (!bookMap.has(item.bookId)) {
        return NextResponse.json(
          { error: `Book not found: ${item.bookId}` },
          { status: 400 }
        );
      }
    }

    const subtotal = rawItems.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const tax = calculateTax(subtotal);
    const deliveryCharge = calculateDeliveryCharge(subtotal);

    // ── Coupon validation ──────────────────────────────────────
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && subtotal >= coupon.minOrderValue) {
        couponDiscount = coupon.discountAmount;
      }
    }

    // ── Gift points redemption ─────────────────────────────────
    let giftPointsDiscount = 0;
    if (useGiftPoints && user.giftPointsBalance > 0) {
      giftPointsDiscount = Math.min(
        user.giftPointsBalance * GIFT_POINTS_VALUE,
        subtotal + tax + deliveryCharge - couponDiscount
      );
    }

    const totalDiscount = couponDiscount + giftPointsDiscount;
    const totalAmount = Math.max(0, subtotal + tax + deliveryCharge - totalDiscount);
    const canCancelUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // ── Persist address + order in a transaction ───────────────
    const order = await prisma.$transaction(async (tx) => {
      // Create/snapshot the delivery address
      const addr = await tx.address.create({
        data: {
          label: rawAddress.label ?? "Delivery",
          fullName: rawAddress.fullName,
          phone: rawAddress.phone ?? "",
          line1: rawAddress.line1,
          line2: rawAddress.line2,
          city: rawAddress.city,
          state: rawAddress.state ?? "",
          pincode: rawAddress.pincode ?? "",
          country: rawAddress.country ?? "India",
          userId: user.id,
        },
      });

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          addressId: addr.id,
          subtotal,
          tax,
          discount: totalDiscount,
          deliveryCharge,
          totalAmount,
          paymentMethod,
          canCancelUntil,
          items: {
            create: rawItems.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              selectedFormat: item.selectedFormat,
              priceAtAdd: item.priceAtAdd,
            })),
          },
        },
        include: { items: true, address: true },
      });

      // Deduct gift points if used
      if (giftPointsDiscount > 0) {
        const pointsUsed = Math.ceil(giftPointsDiscount / GIFT_POINTS_VALUE);
        await tx.user.update({
          where: { id: user.id },
          data: { giftPointsBalance: { decrement: pointsUsed } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { book: true } }, address: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
