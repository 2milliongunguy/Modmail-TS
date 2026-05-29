import { logger } from "../../../../packages/shared/lib/logger";
import { db } from "../../../../packages/shared/src/db";

async function getCategory(guildId: string) {
  const data: { value: string } | null = await db.guildConfig.findFirst({
    where: { guildId: guildId, key: "ticketsCategory" },
    select: { value: true },
  });

  return data;
}

async function createTicket(authorId: string, guildId: string, dmId: string) {
  const category = await getCategory(guildId);
  logger.debug(`${category}`);
}

export { createTicket };
