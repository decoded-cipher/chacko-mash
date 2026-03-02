const { CronJob } = require('cron');
const { EmbedBuilder } = require('discord.js');
const apiClient = require('../services/apiClient');
const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '/bdayNotify',
    description: 'Daily birthday notification cron job',
    usage: '/bdayNotify',
    examples: ['/bdayNotify'],
    permissions: [],
    cooldown: 0,
    enabled: true,
    aliases: ['/birthday-notify', '/bday-cron'],
    requiresGuild: false,
    requiresDM: false,
  },

  async execute(client) {
    try {
      new CronJob(
        '0 6 * * *',
        async () => {
          const mm = new Date().getMonth() + 1;
          const dd = new Date().getDate();
          try {
            const users = await apiClient.getBdayUser(dd, mm);
            const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');

            if (Array.isArray(users) && users.length > 0) {
              for (const user of users) {
                try {
                  const extUser = await apiClient.getExtUserData(user._id);
                  const avatar = extUser.discord.avatar.split('/').pop();
                  const embed = new EmbedBuilder()
                    .setColor(avatar !== 'null.png' ? '#28a745' : '#c25827')
                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                    .setDescription(
                      `Someone is celebrating today!\n\n> **${extUser.name}** - <@${extUser._id}>\n> $birthday | #general | ${extUser._id}`
                    )
                    .setFooter({ text: avatar !== 'null.png' ? 'Copy & Paste the command to generate Birthday Wish' : "Birthday Wish Card can't be generated - update profile pic!" });

                  if (targetChannel && 'send' in targetChannel) {
                    await targetChannel.send({ embeds: [embed] });
                  }
                } catch (err) {
                  logger.error('Error processing birthday user:', err);
                }
              }
            } else if (targetChannel && 'send' in targetChannel) {
              await targetChannel.send('No one is celebrating their birthday today!');
            }
          } catch (err) {
            logger.error('Error in birthday notification job:', err);
          }
        },
        null,
        true,
        'Asia/Kolkata'
      );
      logger.info('Birthday notification cron job started');
    } catch (error) {
      logger.error('Failed to start birthday notification job:', error);
    }
  },

  validate() {
    return true;
  },

  onLoad() {
    return Promise.resolve();
  },

  onUnload() {
    return Promise.resolve();
  },
};
