import { Client, TextChannel, Message } from 'discord.js';
import imageGenerator from '../utils/imageGenerator';
import apiClient from '../services/apiClient';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '$birthday',
    description: 'Generate birthday wishes and images',
    usage: '$birthday | <#channel_id> | <user_id>',
    examples: ['$birthday | #general | 123456789', '$birthday | #birthdays | 987654321'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: true,
    aliases: ['$bday', '$birthday-wish'],
    requiresGuild: true,
    requiresDM: false,
  },
  async execute(client: Client, message: Message, targetChannel: string, userId: string): Promise<void> {
    try {
      const userData = await apiClient.getExtUserData(userId);
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
      
      await message.reply('Birthday wish generated successfully!');
    } catch (error) {
      logger.errorWithContext('Failed to execute birthday command', error);
      await message.reply('Failed to process birthday command. User may not exist in the database.');
    }
  },
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'Birthday command requires channel ID and user ID';
    }
    return true;
  },
}; 