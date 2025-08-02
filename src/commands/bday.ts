import { Client, Message } from 'discord.js';
import apiClient from '../services/apiClient';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '$bday',
    description: 'Generate birthday wish for a user',
    category: 'Fun',
    usage: '$bday | <#channel_id> | <user_id>',
    examples: ['$bday | #general | 123456789', '$bday | #birthdays | 987654321'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: true,
    aliases: ['$birthday', '$birthday-wish'],
    requiresGuild: true,
    requiresDM: false,
  },
  
  async execute(client: Client, message: Message, targetChannel: string, userId: string): Promise<void> {
    try {
      const userData = await apiClient.getExtUserData(userId);
      const command = (global as any).commandRegistry?.get('/birthday');
      if (command) {
        await command.execute(client, targetChannel, userData);
        await message.reply('Birthday wish generated successfully!');
      } else {
        await message.reply('Birthday command not available.');
      }

      logger.info('Bday command executed', {
        userId: message.author.id,
        username: message.author.username,
        targetChannel,
        targetUserId: userId
      });

    } catch (error) {
      logger.errorWithContext('Failed to execute bday command', error);
      await message.reply('Failed to process birthday command. User may not exist in the database.');
    }
  },
  
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'Bday command requires channel ID and user ID';
    }
    return true;
  },
}; 