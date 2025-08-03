import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '$dm',
    description: 'Send direct message to users or roles',
    usage: '$dm | <user_id/role_id> | <message>',
    examples: ['$dm | 123456789 | Hello!', '$dm | 987654321 456789123 | Important message'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: true,
    aliases: ['$dmUser', '$direct-message', '$send-dm'],
    requiresGuild: true,
    requiresDM: false,
  },
  
  async execute(client: Client, message: Message, targets: string, content: string): Promise<void> {
    try {
      if (!message.guild) {
        await message.reply('This command can only be used in a server.');
        return;
      }

      const targetList = targets.split(/[ ]+/);
      const updatedUsers: string[] = [];

      for (const target of targetList) {
        const role = message.guild.roles.cache.find(x => x.id === target);
        
        if (role) {
          // Role exists, get all members of this role
          const roleMembers = role.members.map(m => m.user.id);
          updatedUsers.push(...roleMembers);
        } else {
          // User exists, add directly
          updatedUsers.push(target);
        }
      }

      // Flatten the array and remove duplicates
      const finalUsers = [...new Set(updatedUsers.flat())];
      let successCount = 0;
      let failCount = 0;

      for (const userId of finalUsers) {
        const discordUser = client.users.cache.get(userId);
        if (discordUser) {
          try {
            await discordUser.send(content);
            successCount++;
            
            const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
            if (targetChannel && 'send' in targetChannel) {
              await targetChannel.send(`The message has been delivered to <@${userId}>`);
            }
          } catch (error) {
            failCount++;
            logger.error(`Failed to send DM to ${userId}:`, error);
          }
        } else {
          failCount++;
        }
      }

      await message.reply(`DM delivery completed. Success: ${successCount}, Failed: ${failCount}`);

      logger.info('DM command executed', {
        userId: message.author.id,
        username: message.author.username,
        targets: targetList,
        message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        users: finalUsers,
        successCount,
        failCount
      });

    } catch (error) {
      logger.errorWithContext('Failed to execute dm command', error);
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