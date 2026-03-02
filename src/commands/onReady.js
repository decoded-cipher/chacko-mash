const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '/onReady',
    description: 'Bot ready event handler',
    usage: '/onReady',
    examples: ['/onReady'],
    permissions: [],
    cooldown: 0,
    enabled: true,
    aliases: ['/ready', '/startup'],
    requiresGuild: false,
    requiresDM: false,
  },

  async execute(client) {
    try {
      client.user?.setPresence({
        status: 'online',
        activities: [{ name: 'over Inovus Labs', type: 3 }],
      });

      logger.info(`Logged in as ${client.user?.username}!`);

      const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
      if (targetChannel && 'send' in targetChannel) {
        await targetChannel.send('Server Time: ' + new Date().toString());
      }

      logger.info('Bot ready event executed successfully');
    } catch (error) {
      logger.error('Failed to execute onReady command:', error);
    }
  },

  validate() {
    return true;
  },
};
