import { ActivityType, Events } from "discord.js";
import type { Event } from "../types/Event";
import { logger } from "../../../../packages/shared/lib/logger";

const clientReady: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.startup(
      `Discord client is ready! Logged in as ${client.user.username}`,
    );

    const updatePresence = () => {
      client.user!.setActivity({
        type: ActivityType.Custom,
        name: "DM me for support",
      });
    };

    setInterval(updatePresence, 1000 * 60 * 60);

    updatePresence();
  },
};
export default clientReady;
