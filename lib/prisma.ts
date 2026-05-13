// Singleton Prisma client. In dev, Next.js hot-reload will create a new client
// on every change unless we cache it on globalThis.
//
// Always import the Prisma client from this file:  import { prisma } from "@/lib/prisma"

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
