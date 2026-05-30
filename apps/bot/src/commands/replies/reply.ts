import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types/Command.js";
import { EmbedBuilder } from "@discordjs/builders";
import { db } from "../../../../../packages/shared/src/db.js";
import { sendReply } from "../../utils/ticket.js";

const reply: Command = {
  data: new SlashCommandBuilder()
    .setName("reply")
    .setDescription("Reply to a ticket")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("The message you want to send")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName("anonymous").setDescription("Send message anonymously"),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const content = interaction.options.getString("content")!;
    const anon = interaction.options.getBoolean("anonymous") || false;

    const intChannelId = interaction.channelId;

    const isTicketChannel = await db.ticket.findFirst({
      where: { channelId: intChannelId, closedAt: null },
    });

    if (!isTicketChannel) {
      interaction.editReply("This is not a ticket channel.");
      return;
    }

    const embed = await sendReply(
      content,
      interaction,
      interaction.guildId!,
      intChannelId,
      isTicketChannel.id,
      interaction.client,
      anon,
    );

    if (embed instanceof EmbedBuilder) {
      embed
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({ text: ` ${anon ? "Anonymous" : ""} Response` });

      if (interaction.channel!.isSendable())
        await interaction.channel.send({ embeds: [embed] });

      await interaction.editReply("Successfully replied to user");
      return;
    } else {
      await interaction.editReply(embed as string);
      return;
    }
  },
};

export default reply;
