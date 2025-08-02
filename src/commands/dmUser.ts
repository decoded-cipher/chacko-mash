import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '/dmUser',
    description: 'Send direct message to user or role',
    category: 'Admin',
    usage: '/dmUser <targetRole/users> <message>',
    examples: ['/dmUser 123456789 Hello!', '/dmUser @role1 @user1 Hello everyone!'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: true,
    aliases: ['/dm', '/direct-message'],
    requiresGuild: true,
    requiresDM: false,
  },
  async execute(client: Client, message: Message, targetRole: string, args: string): Promise<void> {
    try {
      if (!message.guild) {
        await message.reply('This command can only be used in a server.');
        return;
      }

      const users = targetRole.split(/[ ]+/);
      const updatedUsers: string[] = [];

      for (const user of users) {
        const role = message.guild.roles.cache.find(x => x.id === user);
        
        if (role) {
          // Role exists, get all members of this role
          const roleMembers = role.members.map(m => m.user.id);
          updatedUsers.push(...roleMembers);
        } else {
          // User exists, add directly
          updatedUsers.push(user);
        }
      }

      // Flatten the array and remove duplicates
      const finalUsers = [...new Set(updatedUsers.flat())];

      for (const userId of finalUsers) {
        const discordUser = client.users.cache.get(userId);
        if (discordUser) {
          await discordUser.send(args);
          const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
          if (targetChannel && 'send' in targetChannel) {
            await targetChannel.send(`The message has been delivered to <@${userId}>`);
          }
        }
      }

      logger.info('DM command executed', {
        targetRole,
        message: args,
        users: finalUsers,
        executor: message.author.id
      });

    } catch (error) {
      logger.error('Failed to execute dmUser command:', error);
      await message.reply('An error occurred while sending the DM.');
    }
  },
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'DM command requires target users/roles and a message';
    }
    return true;
  },
}; 