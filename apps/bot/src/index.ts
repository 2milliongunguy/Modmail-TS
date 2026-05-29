// im going to kms looking at bot.py
// wtf is that

import path from "node:path";
import { logger } from "../../../packages/shared/lib/logger.js";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import fs from "fs";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import { initDb } from "../../../packages/shared/src/db.js";

const allowedEnvs = ["production", "development"];

if (!allowedEnvs.includes(process.env.NODE_ENV || "")) {
  logger.fatal("Invalid environment, Run either 'npm run dev/start'", {
    exit: 1,
  });
}

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
  logger.info("Authors: 2milliongunguy");
  logger.info("Credits to the original ModMail authors");

  await initCommands(client);

  logger.debug("Starting up Discord client");
  client.login(process.env.TOKEN!).catch((err) => {
    logger.fatal("Error starting up the Discord client:", { err }, { exit: 1 });
    return;
  });

  await initDb(process.env.DATABASE_URL!).catch((e) =>
    logger.fatal("Failed to initialize db: ", { e }, { exit: 1 }),
  );
}

async function initCommands(client: Client) {
  logger.debug("Initiating commands...");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  client.commands = new Collection();

  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => {
      if (process.env.NODE_ENV === "production") {
        return file.endsWith(".js");
      }
      return file.endsWith(".ts") || file.endsWith(".js");
    });

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const module = await import(filePath);
      const command = module.default ?? module;

      if ("data" in command && "execute" in command) {
        logger.debug(`${command.data.name} is valid`);
        client.commands.set(command.data.name, command);
      } else {
        logger.warn(
          `Command at ${filePath} is missing "data" or "execute" properties`,
        );
      }
    }
  }

  logger.debug("Commands ready, registering events...");

  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => {
    if (process.env.NODE_ENV === "production") {
      return file.endsWith(".js");
    }
    return file.endsWith(".ts") || file.endsWith(".js");
  });

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const module = await import(filePath);
    const event = module.default ?? module;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  logger.debug("Events and commands ready!");
}

startup().catch((e) =>
  logger.fatal("Failed to start Bot:", { e }, { exit: 1 }),
);
