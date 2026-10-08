// GET  /api/users/me  — return current user profile (with addresses)
// PUT  /api/users/me  — update name and/or email
//                       Body: { name?: string, email?: string }

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name ? String(body.name).trim() : undefined;
  const email = body.email ? String(body.email).trim().toLowerCase() : undefined;

  if (!name && !email) {
    return NextResponse.json(
      { error: "Provide at least one field to update (name or email)" },
      { status: 400 }
    );
  }

  try {
    if (email && email !== user.email) {
      const clash = await prisma.user.findUnique({ where: { email } });
      if (clash) {
        return NextResponse.json(
          { error: "Email is already taken by another account" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      include: { addresses: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[PUT /api/users/me]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
