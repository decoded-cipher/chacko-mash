import { Client } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '/onReady',
    description: 'Bot ready event handler',
    usage: '/onReady',
    examples: ['/onReady'],
    permissions: [],
    cooldown: 0,
    enabled: true,
    aliases: ['/ready', '/startup'],
    requiresGuild: false,
    requiresDM: false,
  },
  async execute(client: Client): Promise<void> {
    try {
      // Set bot presence
      client.user?.setPresence({
        status: 'online',
        activities: [{
          name: 'over Inovus Labs',
          type: 3 // WATCHING
        }]
      });

      logger.info(`Logged in as ${client.user?.username}!`);

      // Send startup messages
      // const lobbyChannel = client.channels.cache.get(process.env.LOBBY_CHANNEL || '');
      // if (lobbyChannel && 'send' in lobbyChannel) {
      //   await lobbyChannel.send('👋');
      //   await lobbyChannel.send(`Hey fellas, I'm back online.\nSorry for the little nap!\n😊`);
      //   await lobbyChannel.send({ files: ['https://user-images.githubusercontent.com/44474792/126882345-a229f1c8-0ad6-455e-b2e4-eba1b580cb2e.jpg'] });
      // }

      const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
      if (targetChannel && 'send' in targetChannel) {
        await targetChannel.send("Server Time : " + new Date().toString());
      }

      logger.info('Bot ready event executed successfully');

    } catch (error) {
      logger.error('Failed to execute onReady command:', error);
    }
  },
  validate(_args: any[]): boolean | string {
    // OnReady command doesn't require additional arguments
    return true;
  },
}; 