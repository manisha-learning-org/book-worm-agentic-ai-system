// POST /api/users/me/addresses
// Add a new delivery address for the current user.
// Body: { label, fullName, phone, line1, line2?, city, state, pincode, country? }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  return NextResponse.json({ addresses });
}

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

  const label = String(body.label ?? "Home").trim();
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const line1 = String(body.line1 ?? "").trim();
  const line2 = body.line2 ? String(body.line2).trim() : undefined;
  const city = String(body.city ?? "").trim();
  const state = String(body.state ?? "").trim();
  const pincode = String(body.pincode ?? "").trim();
  const country = String(body.country ?? "India").trim();

  if (!fullName || !phone || !line1 || !city || !state || !pincode) {
    return NextResponse.json(
      { error: "fullName, phone, line1, city, state and pincode are required" },
      { status: 400 }
    );
  }

  try {
    const address = await prisma.address.create({
      data: { label, fullName, phone, line1, line2, city, state, pincode, country, userId: user.id },
    });
    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users/me/addresses]", err);
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}
