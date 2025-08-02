import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '$bot',
    description: 'Send custom message to a channel',
    category: 'Admin',
    usage: '$bot | <#channel_id> | <message>',
    examples: ['$bot | #general | Hello everyone!', '$bot | #announcements | Important announcement'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 5,
    enabled: true,
    aliases: ['$send', '$message'],
    requiresGuild: true,
    requiresDM: false,
  },
  
  async execute(client: Client, message: Message, targetChannel: string, content: string): Promise<void> {
    try {
      const channel = client.channels.cache.get(targetChannel);
      if (channel && 'send' in channel) {
        await channel.send(content);
        await message.reply('Message sent successfully!');
      } else {
        await message.reply('Invalid channel ID or channel not found.');
      }

      logger.info('Bot command executed', {
        userId: message.author.id,
        username: message.author.username,
        targetChannel,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : '')
      });

    } catch (error) {
      logger.errorWithContext('Failed to execute bot command', error);
      await message.reply('An error occurred while sending the message.');
    }
  },
  
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'Bot command requires channel ID and message content';
    }
    return true;
  },
}; 