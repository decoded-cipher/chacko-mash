import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  name: '/roles',
  description: 'Assign server roles',
  async execute(client: Client, message: Message, targetRole: string, args: string): Promise<void> {
    try {
      if (!message.guild) {
        await message.reply('This command can only be used in a server.');
        return;
      }

      const role = message.guild.roles.cache.find(r => r.id === targetRole);
      if (!role) {
        await message.reply('Role not found.');
        return;
      }

      const users = args.split(/[ ]+/);
      for (const user of users) {
        const userId = user.replace(/[^0-9]/g, '');
        const member = message.guild.members.cache.get(userId);
        
        if (member) {
          await member.roles.add(role);
          const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
          if (targetChannel && 'send' in targetChannel) {
            await targetChannel.send(`<@${userId}> has been given the role <@&${role.id}>`);
          }
        }
      }

      logger.info('Roles command executed', {
        targetRole,
        users: args,
        executor: message.author.id
      });

    } catch (error) {
      logger.error('Failed to execute roles command:', error);
      await message.reply('An error occurred while managing roles.');
    }
  },
}; 