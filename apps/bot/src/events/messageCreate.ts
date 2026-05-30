import { ChannelType, Events } from "discord.js";
import type { Event } from "../types/Event";
import { logger } from "../../../../packages/shared/lib/logger";
import { db } from "../../../../packages/shared/src/db";
import { createTicket, sendMessage } from "../utils/ticket";

const messageCreate: Event<Events.MessageCreate> = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.type === ChannelType.DM && !message.author.bot) {
      logger.debug(`DM Received by ${message.author.username}`);

      const ticket = await db.ticket.findFirst({
        where: { userId: message.author.id, closedAt: null },
      });

      if (!ticket) {
        logger.bot(
          `User ${message.author.username} does not have a ticket, creating...`,
        );

        //* make it ask the user for the guild to make ticket if more than 1 guilds are shared
        await createTicket(
          message.author.id,
          message.channelId,
          process.env.GUILD_ID!,
          message,
        )
        return;
      } else {
        logger.bot(`Sending reply from ${message.author.username}: `, {
          content: message.content,
        });

        await sendMessage(message);

        const ticket = await db.ticket.findFirst({
          where: { dmId: message.channelId, closedAt: null },
        });

        const messages = await db.message.findMany({
          where: { ticketId: ticket?.id || 1 },
        });

        logger.debug("", { ticket, messages });
        return;
      }
    } else return;
  },
};

export default messageCreate;
