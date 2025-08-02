import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '/roles',
    description: 'Assign server roles',
    category: 'Admin',
    usage: '/roles <targetRole> <users...>',
    examples: ['/roles 123456789 @user1 @user2', '/roles 987654321 @user1'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 5,
    enabled: true,
    aliases: ['/role', '/assign-role'],
    requiresGuild: true,
    requiresDM: false,
  },
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
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'Roles command requires target role and at least one user';
    }
    return true;
  },
}; 