import { ChannelType, Events, MessageFlags } from "discord.js";
import type { Event } from "../types/Event";
import { logger } from "../../../../packages/shared/lib/logger";
import { upsertSetting } from "../utils/config";

const modalInteraction: Event<Events.InteractionCreate> = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "setupModal") {
      const categories = interaction.fields.getSelectedChannels(
        "category",
        true,
        [ChannelType.GuildCategory],
      );
      const supportRoles = interaction.fields.getSelectedRoles("supportRoles");

      const category = categories.first();
      const roleIds = supportRoles?.map((i) => i?.id).join(",");

      if (!category) {
        await interaction.reply({
          content: "Missing category",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      const rows = await upsertSetting(
        interaction.guildId || process.env.GUILD_ID!,
        "ticketsCategory",
        category.id,
      );

      const supportRows = await upsertSetting(
        interaction.guildId || process.env.GUILD_ID!,
        "supportRoles",
        roleIds,
      );

      logger.debug("Updated Config", { rows, supportRows });
      await interaction.reply({
        content: `Tickets will now be created in ${category}`,
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
};

export default modalInteraction;
