import { PrismaClient } from "@prisma/client";

/** Bump when Prisma schema fields change so long-lived `next dev` drops a stale client. */
const PRISMA_SCHEMA_STAMP =
  "storeStaff.allowedTabs+sellInquiry.actualPrice";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaStamp?: string;
};

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function clientLooksCurrent(client: PrismaClient) {
  return (
    typeof client.catalogSeries?.findMany === "function" &&
    typeof client.storeStaff?.findMany === "function"
  );
}

function getPrisma() {
  const existing = globalForPrisma.prisma;
  if (
    existing &&
    globalForPrisma.prismaStamp === PRISMA_SCHEMA_STAMP &&
    clientLooksCurrent(existing)
  ) {
    return existing;
  }
  if (existing) {
    void existing.$disconnect().catch(() => undefined);
  }
  const client = createPrisma();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaStamp = PRISMA_SCHEMA_STAMP;
  return client;
}

export const prisma = getPrisma();
