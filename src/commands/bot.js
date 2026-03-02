module.exports = {
  metadata: {
    name: '$bot',
    description: 'Send custom message to a channel',
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
    } catch (error) {
      console.error('Failed to execute bot command:', error);
      await message.reply('An error occurred while sending the message.');
    }
  },

  validate(args) {
    if (args.length < 2) return 'Bot command requires channel ID and message content';
    return true;
  },
};
