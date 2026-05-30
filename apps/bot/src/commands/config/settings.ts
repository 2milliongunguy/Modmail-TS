import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types/Command.js";
import { EmbedBuilder } from "@discordjs/builders";
import { db } from "../../../../../packages/shared/src/db.js";

function formatSupportRoles(value: string) {
  return value
    .split(",")
    .map((id) => `<@&${id}>`)
    .join(", ");
}

const settings: Command = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Show existing server settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const data = await db.guildConfig.findMany({
      where: { guildId: interaction.guildId || "" },
      take: 24, // take 24 interactive is releasing GTA 26 in the year 2267, trust me, i wouldn't lie
    });

    const fields = data.map((r) => ({
      name: r.key,
      value: r.key === "supportRoles" ? formatSupportRoles(r.value) : r.value,
      inline: true,
    }));

    const embed = new EmbedBuilder()
      .setTitle("Server settings")
      .setDescription("View the settings of this server below")
      .setColor(0x00ff00)
      .setFields(fields);

    await interaction.editReply({ embeds: [embed] });
  },
};

export default settings;
