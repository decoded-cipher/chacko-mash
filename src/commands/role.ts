import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '$role',
    description: 'Assign role to users',
    usage: '$role | <role_id> | <user_1> <user_2> ...',
    examples: ['$role | 123456789 | 987654321', '$role | 456789123 | 111222333 444555666'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 5,
    enabled: true,
    aliases: ['$roles', '$assign-role', '$add-role'],
    requiresGuild: true,
    requiresDM: false,
  },
  
  async execute(client: Client, message: Message, targetRole: string, users: string): Promise<void> {
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

      const userList = users.split(/[ ]+/);
      let successCount = 0;
      let failCount = 0;

      for (const user of userList) {
        const userId = user.replace(/[^0-9]/g, '');
        const member = message.guild.members.cache.get(userId);
        
        if (member) {
          try {
            await member.roles.add(role);
            successCount++;
            
            const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
            if (targetChannel && 'send' in targetChannel) {
              await targetChannel.send(`<@${userId}> has been given the role <@&${role.id}>`);
            }
          } catch (error) {
            failCount++;
            logger.error(`Failed to assign role to ${userId}:`, error);
          }
        } else {
          failCount++;
        }
      }

      await message.reply(`Role assignment completed. Success: ${successCount}, Failed: ${failCount}`);

      logger.info('Role command executed', {
        userId: message.author.id,
        username: message.author.username,
        targetRole,
        users: userList,
        successCount,
        failCount
      });

    } catch (error) {
      logger.errorWithContext('Failed to execute role command', error);
      await message.reply('An error occurred while managing roles.');
    }
  },
  
  validate(args: any[]): boolean | string {
    if (args.length < 2) {
      return 'Role command requires role ID and at least one user';
    }
    return true;
  },
}; 