import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma() {
  const existing = globalForPrisma.prisma;
  // A long-lived `next dev` process can keep a client from before CatalogSeries existed.
  if (existing && typeof existing.catalogSeries?.findMany === "function") {
    return existing;
  }
  const client = createPrisma();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();
