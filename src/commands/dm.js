const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '$dm',
    description: 'Send direct message to users or roles',
    usage: '$dm | <user_id/role_id> | <message>',
    examples: ['$dm | 123456789 | Hello!'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: true,
    aliases: ['$dmUser', '$direct-message'],
    requiresGuild: true,
    requiresDM: false,
  },

  async execute(client, message, targets, content) {
    try {
      if (!message.guild) {
        await message.reply('This command can only be used in a server.');
        return;
      }

      const targetList = targets.split(/\s+/);
      const updatedUsers = [];

      for (const target of targetList) {
        const role = message.guild.roles.cache.find((x) => x.id === target);
        if (role) {
          updatedUsers.push(...role.members.map((m) => m.user.id));
        } else {
          updatedUsers.push(target);
        }
      }

      const finalUsers = [...new Set(updatedUsers)];
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
              await targetChannel.send(`Message delivered to <@${userId}>`);
            }
          } catch (err) {
            failCount++;
          }
        } else {
          failCount++;
        }
      }

      await message.reply(`DM delivery completed. Success: ${successCount}, Failed: ${failCount}`);
      logger.info('DM command executed', { userId: message.author.id, successCount, failCount });
    } catch (error) {
      logger.errorWithContext('Failed to execute dm command', error);
      await message.reply('An error occurred while sending the DM.');
    }
  },

  validate(args) {
    if (args.length < 2) return 'DM command requires target users/roles and a message';
    return true;
  },
};
