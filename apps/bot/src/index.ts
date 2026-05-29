// im going to kms looking at bot.py
// wtf is that

import path from "node:path";
import { logger } from "../../../packages/shared/lib/logger.js";
import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.GuildMember,
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
  ],
});

async function startup() {
  logger.info("┌┬┐┌─┐┌┬┐┌┬┐┌─┐┬┬");
  logger.info("││││ │ │││││├─┤││");
  logger.info("┴ ┴└─┘─┴┘┴ ┴┴ ┴┴┴─┘");
  logger.info("Authors: kyb3r, fourjr, Taaku18, 2milliongunguy");

  client.login(process.env.TOKEN!).catch((err) => {
    logger.fatal("Error starting up the Discord client:", { err }, { exit: 1 });
  });

  client.once(Events.ClientReady, (client) => {
    logger.startup(
      `Discord client is ready! Logged in as ${client.user.username}`,
    );
  });
}

startup();
