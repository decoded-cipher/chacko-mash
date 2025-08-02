import { Client, TextChannel } from 'discord.js';
import { UserData } from '../types';
import imageGenerator from '../utils/imageGenerator';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '/birthday',
    description: 'Generate birthday wishes and images',
    category: 'Fun',
    usage: '/birthday <targetChannel> <userData>',
    examples: ['/birthday 123456789 userData'],
    permissions: [],
    cooldown: 10,
    enabled: true,
    aliases: ['/bday', '/birthday-wish'],
    requiresGuild: true,
    requiresDM: false,
  },
  async execute(client: Client, targetChannel: string, userData: UserData): Promise<void> {
    try {
      logger.command('birthday', userData._id);

      // Generate birthday image using the separate service
      const imagePath = await imageGenerator.generateBirthdayImage(userData);

      // Send birthday messages
      const channel = client.channels.cache.get(targetChannel) as TextChannel;
      if (!channel) {
        throw new Error(`Target channel ${targetChannel} not found`);
      }

      await channel.send(`"This birthday, I wish you abundant happiness and love. May all your dreams turn into reality and may lady luck visit your home today. Happy birthday <@${userData._id}>."`);
      await channel.send('https://tenor.com/view/simhavalan-menon-jagathy-malayalam-happy-birthday-santhosha-janmadinam-kuttikku-gif-17580455');
      await channel.send({ files: [imagePath] });

      const age = new Date().getFullYear() - userData.dob.year;
      logger.success(`Birthday command executed successfully for ${userData.name} (age: ${age})`);
    } catch (error) {
      logger.errorWithContext('Failed to execute birthday command', error);
      throw error;
    }
  },
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'Birthday command requires target channel and user data';
    }
    return true;
  },
}; 