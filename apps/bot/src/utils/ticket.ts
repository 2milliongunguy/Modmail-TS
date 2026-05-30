import {
  Attachment,
  Client,
  EmbedBuilder,
  PermissionsBitField,
  type Interaction,
  type Message,
} from "discord.js";
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

    const supportIds = await db.guildConfig.findUnique({
      where: { guildId_key: { guildId, key: "supportRoles" } },
      select: { value: true },
    });

    const ids = supportIds?.value.split(",") ?? [];

    const channel = await guild.channels.create({
      name: author?.username,
      type: 0,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guildId,
          deny: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: author.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        ...ids.map((id) => ({
          id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        })),
      ],
    });

    const guildUser = await guild.members.fetch(author.id);

    if (!guildUser) {
      logger.error(`Failed to get guild user ${author.username} (${authorId})`);
    }

    const embed = new EmbedBuilder()
      .setTitle(author.username)
      .setDescription(
        `${author}'s account was created ${author.createdTimestamp}`,
      )
      .setFields([
        {
          name: "Roles",
          value: `${guildUser ? guildUser.roles.cache.map((role) => `<@&${role.id}>`) : "Failed to fetch guild user"}`,
        },
      ])
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setTimestamp()
      .setFooter({
        text: `User ID: ${author.id} • DM ID: ${message?.channelId}`,
      })
      .setColor("Yellow");

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

    await channel.send({ embeds: [embed] }).then(async () => {
      message?.react("✅");
      await db.message
        .create({
          data: {
            messageId: message?.id || "",
            ticketId: data.id,
            authorId: author.id,
            authorName: author.id,
            content: [message?.content || ""],
            authorProfileLink: author.displayAvatarURL(),
          },
        })
        .catch((e) => {
          logger.error("Failed to store message", { e });
        });
    });

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

    const embed = new EmbedBuilder()
      .setDescription(`${message.content}`)
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp()
      .setFooter({
        text: `Message ID: ${message.id}`,
      })
      .setColor("Yellow");

    return ticketChannel
      .send({ embeds: [embed] })
      .then(async () => {
        message.react("✅");
        await db.message
          .create({
            data: {
              messageId: message.id,
              ticketId: tID,
              authorId: message.author.id,
              authorName: message.author.username,
              content: [message.content],
              authorProfileLink: message.author.displayAvatarURL(),
            },
          })
          .catch((e) => {
            logger.error("Failed to store message", { e });
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
export async function sendReply(
  content: string,
  interaction: Interaction,
  guildId: string,
  channelId: string,
  ticketId: number,
  client: Client,
  anonymous: boolean = false,
  attatchments?: Attachment,
): Promise<string | EmbedBuilder> {
  const ticket = await db.ticket.findFirst({
    where: { guildId, channelId, closedAt: null },
    select: { dmId: true, userId: true },
  });

  if (!ticket) {
    return "Ticket not found or doesn't exist.";
  }

  let dm = await client.channels.fetch(ticket.dmId);

  if (!dm) {
    const user = await client.users.fetch(ticket.userId, {
      force: true,
      cache: false,
    });

    if (user) {
      dm = await user.createDM();
    } else return "Couldn't create or find a DM channel";
  }

  const embed = new EmbedBuilder()
    .setDescription(`${content}`)
    .setAuthor({
      name: anonymous ? "Anonymous" : interaction.user.username,
      iconURL: anonymous
        ? interaction.guild!.iconURL()!.toString()
        : interaction.user.displayAvatarURL(),
    })
    .setTimestamp()
    .setFooter({
      text: interaction.guild!.name,
    })
    .setColor("Green");

  if (!dm.isSendable()) return "Cannot send DM to user";

  await dm.send({ embeds: [embed] }).then(async (message) => {
    await db.message.create({
      data: {
        messageId: message.id,
        ticketId,
        authorId: interaction.user.id,
        authorName: interaction.user.username,
        content: [content],
        authorProfileLink: interaction.user.displayAvatarURL(),
        anonymous,
        reply: true,
      },
    });
  });

  return embed as EmbedBuilder;
}

export { createTicket };
