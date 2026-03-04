const { EmbedBuilder } = require('discord.js');
const d1Client = require('../services/d1Client');
const { version } = require('../../package.json');

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
        activities: [{ name: 'Watching over Inovus Labs', type: 3 }],
      });

      console.log(`--- Logged in as ${client.user?.tag}`);

      let d1Status = 'Not configured';
      let d1Emoji = '⚪';
      if (d1Client.ready) {
        try {
          await d1Client.query('SELECT 1');
          d1Status = 'Connected';
          d1Emoji = '🟢';
          console.log('--- D1 database connection successful\n');
        } catch (err) {
          d1Status = 'Connection failed';
          d1Emoji = '🔴';
          console.error('D1 database connection failed:', err.message);
        }
      }

      const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
      if (targetChannel && 'send' in targetChannel) {
        const isConnected = d1Status === 'Connected';
        const color = isConnected ? 0x00d4aa : 0xff0000;
        const title = isConnected ? 'All systems operational' : d1Status === 'Connection failed' ? 'Database connection issue' : 'Database not configured';
        const description = isConnected
          ? 'Bot is online and fully operational. All features are available.'
          : d1Status === 'Connection failed'
            ? 'Database unavailable. Birthday features disabled until connection is restored.'
            : 'Database not configured. Birthday features disabled.';

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setDescription(description)
          .addFields(
            { name: 'Database', value: `${d1Emoji} ${d1Status}`, inline: true },
            { name: 'Version', value: `v${version}`, inline: true }
          )
          .setFooter({ text: `Chacko Mash v${version}` })
          .setTimestamp();

        await targetChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Failed to execute onReady command:', error);
    }
  },

  validate() {
    return true;
  },
};
