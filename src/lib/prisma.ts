// ─────────────────────────────────────────────────────────────
//  Prisma Client Singleton
//  Re-use a single PrismaClient instance across hot-reloads in
//  development (Next.js creates new module instances on each HMR
//  cycle; without this guard you'd exhaust DB connections).
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
