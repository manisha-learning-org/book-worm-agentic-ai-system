// DELETE /api/users/me/addresses/[id]
// Remove a saved delivery address. Only the owning user may delete it.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    if (address.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/users/me/addresses/[id]]", err);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
