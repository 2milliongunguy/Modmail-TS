import { ChannelType, Events } from "discord.js";
import type { Event } from "../types/Event";
import { logger } from "../../../../packages/shared/lib/logger";
import { db } from "../../../../packages/shared/src/db";
import { createTicket } from "../utils/ticket";

const messageCreate: Event<Events.MessageCreate> = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.type === ChannelType.DM) {
      logger.debug(`DM Received by ${message.author.username}`);

      const ticket = await db.ticket.findFirst({
        where: { userId: message.author.id, closedAt: null },
      });

      if (!ticket) {
        logger.bot(
          `User ${message.author.username} does not have a ticket, creating...`,
        );

        //* make it ask the user for the guild to make ticket if more than 1
        createTicket(
          message.author.id,
          process.env.GUILD_ID!,
          message.channelId,
        );
      }
    } else return;
  },
};

export default messageCreate;
