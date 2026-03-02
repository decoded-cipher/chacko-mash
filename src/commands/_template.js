/**
 * Command Template - Copy and rename to create new commands.
 * Files starting with _ are NOT loaded (e.g. _template.js)
 */
module.exports = {
  metadata: {
    name: '/template',
    description: 'Template command',
    permissions: [],
    cooldown: 5,
    enabled: false,
  },

  async execute(_client, message) {
    await message.reply('Template command executed successfully!');
  },

  validate() {
    return true;
  },
};
