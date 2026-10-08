// DELETE /api/wishlist/[bookId]
// Remove a book from the current user's wishlist.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, bookId },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/wishlist/[bookId]]", err);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
