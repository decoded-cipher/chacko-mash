const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '$bot',
    description: 'Send custom message to a channel',
    usage: '$bot | <#channel_id> | <message>',
    examples: ['$bot | #general | Hello everyone!'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 5,
    requiresGuild: true,
  },

  async execute(client, message, targetChannel, content) {
    try {
      const channel = client.channels.cache.get(targetChannel);
      if (channel && 'send' in channel) {
        await channel.send(content);
        await message.reply('Message sent successfully!');
      } else {
        await message.reply('Invalid channel ID or channel not found.');
      }
      logger.info('Bot command executed', { userId: message.author.id, targetChannel });
    } catch (error) {
      logger.errorWithContext('Failed to execute bot command', error);
      await message.reply('An error occurred while sending the message.');
    }
  },

  validate(args) {
    if (args.length < 2) return 'Bot command requires channel ID and message content';
    return true;
  },
};
