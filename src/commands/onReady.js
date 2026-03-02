module.exports = {
  metadata: {
    name: '/onReady',
    description: 'Bot ready event handler',
    permissions: [],
  },

  async execute(client) {
    try {
      client.user?.setPresence({
        status: 'online',
        activities: [{ name: 'over Inovus Labs', type: 3 }],
      });

      console.log(`Logged in as ${client.user?.tag}`);

      const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
      if (targetChannel && 'send' in targetChannel) {
        await targetChannel.send('Server Time: ' + new Date().toString());
      }
    } catch (error) {
      console.error('Failed to execute onReady command:', error);
    }
  },

  validate() {
    return true;
  },
};
