import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { logger } from "../lib/logger";

export let db: PrismaClient;
export let dbInitialized: boolean = false;

export async function initDb(DATABASE_URL: string) {
  if (!DATABASE_URL)
    throw new Error("Failed to init db", { cause: "Missing DATABASE_URL" });
  try {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    dbInitialized = true;

    logger.debug("Database initialized");

    return (db = new PrismaClient({ adapter }));
  } catch (error) {
    throw new Error("Failed to init db", { cause: error });
  }
}
