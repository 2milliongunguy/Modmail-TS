import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/Command";

const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong"),
  async execute(interaction) {
    await interaction.reply("pong");
  },
};

export default ping;
