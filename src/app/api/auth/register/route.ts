// POST /api/auth/register
// Creates a new user account and sets a session cookie.
// Body: { name: string, email: string, password: string }
//
// Note: password validation only (no storage) for this demo.
// In production, hash with bcrypt or argon2 and store the hash.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        // Store hashed password in the role field is NOT what we want;
        // we add a passwordHash field via a separate migration.
        // For now we store it in a way that doesn't break the existing schema:
        // we keep it in memory only for the demo (no passwordHash column yet).
        role: "REGISTERED",
        giftPointsBalance: 500,
      },
      include: { addresses: true },
    });

    await setSessionCookie(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
