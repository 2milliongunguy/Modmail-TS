type Configs = "ticketsCategory" | "supportRoles" | null;

import { db } from "../../../../packages/shared/src/db";

export async function getSetting(guildId: string, key: Configs) {
  if (!key) return { value: null, error: "You must have a key" };

  const data = await db.guildConfig.findFirst({
    where: { guildId: guildId, key },
    select: { value: true },
  });

  return data as { value: string; error: null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertSetting(guildId: string, key: Configs, value: any) {
  if (!key) return { error: "You must have a key" };

  const data = await db.guildConfig.upsert({
    where: { guildId_key: { guildId, key } },
    update: { value },
    create: { guildId, key, value },
  });

  return data;
}
