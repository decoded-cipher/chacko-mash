import { Client, Message } from 'discord.js';

export default {
  name: '/dmUser',
  description: 'Send direct message to user or role',
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

      console.log('DM command executed', {
        targetRole,
        message: args,
        users: finalUsers,
        executor: message.author.id
      });

    } catch (error) {
      console.error('Failed to execute dmUser command:', error);
      await message.reply('An error occurred while sending the DM.');
    }
  },
}; 