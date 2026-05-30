import {
  ChannelType,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types/Command.js";
import { logger } from "../../../../../packages/shared/lib/logger.js";
import { LabelBuilder, ModalBuilder } from "@discordjs/builders";

const setup: Command = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup server config")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    logger.debug(`Setting up server ${interaction.guild?.name}`);

    const modal = new ModalBuilder()
      .setCustomId("setupModal")
      .setTitle("Setup");

    const ticketsCategory = new LabelBuilder()
      .setLabel("Where should newly created tickets go?")
      .setChannelSelectMenuComponent((channel) =>
        channel
          .addChannelTypes(ChannelType.GuildCategory)
          .setCustomId("category")
          .setRequired(true),
      );

    const supportRoles = new LabelBuilder()
      .setLabel("Who should have access to tickets?")
      .setRoleSelectMenuComponent((role) =>
        role
          .setCustomId("supportRoles")
          .setRequired(true)
          .setMaxValues(10)
          .setMinValues(1),
      );

    modal.addLabelComponents(ticketsCategory, supportRoles);
    await interaction.showModal(modal);
  },
};

export default setup;
