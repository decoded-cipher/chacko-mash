/**
 * Command Template - Copy and rename to create new commands.
 * Files starting with _ are NOT loaded (e.g. _template.js)
 */
const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '/template',
    description: 'Template command',
    usage: '/template [args]',
    examples: ['/template'],
    permissions: [],
    cooldown: 5,
    enabled: false,
    aliases: ['/t'],
    requiresGuild: false,
    requiresDM: false,
  },

  async execute(_client, message, ...args) {
    logger.info('Template command executed', { userId: message.author.id, args });
    await message.reply('Template command executed successfully!');
  },

  validate() {
    return true;
  },
};
