import { ChannelType, type Message } from "discord.js";
import { logger } from "../../../../packages/shared/lib/logger";
import { db } from "../../../../packages/shared/src/db";
import { getSetting } from "./config";

const tickets = new Map();
const guildTicket = new Map();
const ticketId = new Map();

async function createTicket(
  authorId: string,
  dmId: string,
  guildId: string,
  message: Message | null,
) {
  try {
    const guild = message?.client.guilds.cache.get(guildId);
    const author = await message?.client.users.fetch(authorId, {
      cache: false,
      force: true,
    });

    if (!author) {
      logger.error("User does not exist");
      return message?.react("❌");
    }

    if (!guild) {
      logger.error("Guild does not exist");
      return message?.react("❌");
    }

    const categoryRow = await getSetting(guildId, "ticketsCategory");

    if (!categoryRow || !categoryRow.value) {
      logger.error("Category not set up!!");
      return message?.react("❌");
    }

    const category = await guild.channels.fetch(categoryRow.value);

    if (!category) {
      logger.error("Category not valid!!");
      return message?.react("❌");
    }
    logger.debug(`${category.name}: `, { category });

    const channel = await guild.channels.create({
      name: author?.username,
      type: 0,
      parent: category.id,
      permissionOverwrites: [
        {
          id: author.id,
          allow: ["ViewChannel", "SendMessages"],
        },
      ],
    });

    const data = await db.ticket.create({
      data: {
        userId: author.id,
        guildId: guildId,
        dmId: dmId,
        channelId: channel.id,
      },
    });

    tickets.set(dmId, channel.id);
    guildTicket.set(dmId, guild.id);
    ticketId.set(dmId, data.id);

    return message?.react("✅");
  } catch (error) {
    logger.error("Error creating ticket: ", { error });
    return message?.react("❌");
  }
}

export async function sendMessage(message: Message) {
  try {
    let ticketChannelId: string = tickets.get(message.channelId);
    let guildId: string = guildTicket.get(message.channelId);
    let tID: number = ticketId.get(message.channelId);

    if (!ticketChannelId || !guildId || !tID) {
      const ticket = await db.ticket.findFirst({
        where: { dmId: message.channelId, closedAt: null },
        select: { channelId: true, guildId: true, id: true },
      });

      if (!ticket) {
        logger.error("Send message triggered without a valid ticket open");
        return message?.react("❌");
      }
      ticketChannelId = ticket.channelId;
      guildId = ticket.guildId;
      tID = ticket.id;
    }

    const ticketGuild = message.client.guilds.cache.get(guildId);
    const ticketChannel = await ticketGuild?.channels.fetch(ticketChannelId);

    if (!ticketChannel || !ticketChannel.isSendable()) {
      logger.error("Channel does not exist. Closing ticket...");
      return message?.react("🔄");
    }

    return ticketChannel
      .send(message.content)
      .then(async (m) => {
        message.react("✅");
        await db.message
          .create({
            data: {
              messageId: message.id,
              ticketId: tID,
              authorId: message.author.id,
              authorName: message.author.username,
              authorProfileLink: message.author.displayAvatarURL(),
            },
          })
          .catch((e) => {
            logger.error("Failed to store message", { e });
            m.react("❌");
          });
      })
      .catch((e) => {
        logger.error("Error sending message: ", { e });
        return message.react("❌");
      });
  } catch (error) {
    logger.error("Error sending ticket message: ", { error });
    return message.react("❌");
  }
}
// async function sendReply

export { createTicket };
