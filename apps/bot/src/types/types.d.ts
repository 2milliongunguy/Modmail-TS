import { Collection } from "discord.js";
import type { Command } from "./Command.ts";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
