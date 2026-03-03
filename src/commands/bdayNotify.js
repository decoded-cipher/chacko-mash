const { CronJob } = require('cron');
const { EmbedBuilder } = require('discord.js');
const d1Client = require('../services/d1Client');

module.exports = {
  metadata: {
    name: '/bdayNotify',
    description: 'Daily birthday notification cron job',
    permissions: [],
  },

  async execute(client) {
    try {
      new CronJob(
        '0 6 * * *',
        async () => {
          const mm = new Date().getMonth() + 1;
          const dd = new Date().getDate();
          const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');

          try {
            if (!d1Client.ready) return;

            const users = await d1Client.getBirthdayStudents(dd, mm);

            if (Array.isArray(users) && users.length > 0) {
              for (const student of users) {
                try {
                  const discordId = student.discord_user_id;
                  const name = d1Client.getStudentDisplayName(student);
                  const discordUser = await client.users.fetch(discordId).catch(() => null);
                  const hasCustomAvatar = d1Client.hasCustomAvatar(discordUser);

                  const embed = new EmbedBuilder()
                    .setColor(hasCustomAvatar ? '#28a745' : '#c25827')
                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                    .setDescription(
                      `Someone is celebrating today!\n\n> **${name}** - <@${discordId}>\n> $birthday | #general | ${discordId}`
                    )
                    .setFooter({
                      text: hasCustomAvatar
                        ? 'Copy & Paste the command to generate Birthday Wish'
                        : "Birthday Wish Card can't be generated - update profile pic!",
                    });

                  if (targetChannel && 'send' in targetChannel) {
                    await targetChannel.send({ embeds: [embed] });
                  }
                } catch (err) {
                  console.error('Error processing birthday user:', err);
                }
              }
            } else if (targetChannel && 'send' in targetChannel) {
              await targetChannel.send('No one is celebrating their birthday today!');
            }
          } catch (err) {
            console.error('Error in birthday notification job:', err);
          }
        },
        null,
        true,
        'Asia/Kolkata'
      );
    } catch (error) {
      console.error('Failed to start birthday notification job:', error);
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
