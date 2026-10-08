// POST /api/coupons/validate
// Validates a coupon code against the current cart subtotal.
// Body: { code: string, subtotal: number }
// Returns the coupon details if valid, or an error message if invalid/expired.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: { code?: unknown; subtotal?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);

  if (!code) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `This coupon requires a minimum order value of ₹${coupon.minOrderValue}`,
          minOrderValue: coupon.minOrderValue,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        minOrderValue: coupon.minOrderValue,
        description: coupon.description,
      },
    });
  } catch (err) {
    console.error("[POST /api/coupons/validate]", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
