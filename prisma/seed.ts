// ─────────────────────────────────────────────────────────────
//  Book Worm – Prisma Seed Script
//  Run with:  npx prisma db seed
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { mockBooks, mockCoupons, mockUser } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding Book Worm database…");

  // ── Coupons ────────────────────────────────────────────────
  for (const coupon of mockCoupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        minOrderValue: coupon.minOrderValue,
        description: coupon.description ?? "",
      },
    });
  }
  console.log(`✅  Seeded ${mockCoupons.length} coupons`);

  // ── Default User ───────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: mockUser.email },
    update: {},
    create: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      giftPointsBalance: mockUser.giftPointsBalance,
      createdAt: mockUser.createdAt,
      addresses: {
        create: mockUser.savedAddresses.map((addr) => ({
          id: addr.id,
          label: addr.label,
          fullName: addr.fullName,
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
        })),
      },
    },
  });
  console.log(`✅  Seeded user: ${user.email}`);

  // ── Books ──────────────────────────────────────────────────
  for (const book of mockBooks) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: {
        id: book.id,
        title: book.title,
        author: book.author,
        authorBio: book.authorBio,
        authorImage: book.authorImage,
        publisher: book.publisher,
        format: book.format,
        category: book.category,
        price: book.price,
        originalPrice: book.originalPrice,
        rating: book.rating,
        reviewCount: book.reviewCount,
        copiesSold: book.copiesSold,
        coverImage: book.coverImage,
        tentativeDeliveryDays: book.tentativeDeliveryDays,
        isBestseller: book.isBestseller,
        isNewLaunch: book.isNewLaunch,
        description: book.description,
        pages: book.pages,
        language: book.language ?? "English",
        isbn: book.isbn,
        publishedDate: book.publishedDate,
      },
    });
  }
  console.log(`✅  Seeded ${mockBooks.length} books`);

  console.log("🎉  Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
