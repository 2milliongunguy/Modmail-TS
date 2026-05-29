import dotenv from "dotenv";
import {
  REST,
  Routes,
  type RESTPutAPIApplicationGuildCommandsResult,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../../../packages/shared/lib/logger";
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const allowedEnvs = ["production", "development"];

if (!allowedEnvs.includes(process.env.NODE_ENV || "")) {
  logger.fatal("Invalid environment, Run either 'npm run dev/start'", {
    exit: 1,
  });
}

const commands = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

(async () => {
  try {
    if (!process.env.CLIENT_ID || !process.env.GUILD_ID)
      logger.fatal(
        "Missing environments: ",
        {
          GUILD_ID: process.env.GUILD_ID,
          CLIENT_ID: process.env.CLIENT_ID,
        },
        { exit: 1 },
      );
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
          commands.push(command.data.toJSON());
        } else {
          logger.warn(
            `Command at ${filePath} is missing "data" or "execute" properties`,
          );
        }
      }
    }

    logger.bot(`Started refreshing ${commands.length} commands.`);
    const rest = new REST().setToken(process.env.TOKEN!);

    const data = (await rest.put(
      Routes.applicationCommands(
        process.env.CLIENT_ID!,
      ),
      { body: commands },
    )) as RESTPutAPIApplicationGuildCommandsResult;

    logger.bot(`Reloaded ${data.length} commands.`);
  } catch (error) {
    logger.error("Error refreshing commands", { error });
    process.exit(1);
  }
})();
