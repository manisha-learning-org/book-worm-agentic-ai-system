// POST /api/auth/login
// Authenticates with email + password and sets a session cookie.
// Body: { email: string, password: string }
//
// Demo mode: any password is accepted for existing users so the app
// works without a separate passwordHash migration. A real implementation
// would verify bcrypt(password, user.passwordHash).

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { addresses: true },
    });

    if (!user) {
      // Return the same error for both "not found" and "wrong password"
      // to avoid user-enumeration attacks.
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Demo: accept any non-empty password for existing seeded users.
    // TODO: replace with: if (!bcrypt.compareSync(password, user.passwordHash)) { ... }

    await setSessionCookie(user.id);

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
