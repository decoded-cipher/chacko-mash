import { Client, EmbedBuilder } from 'discord.js';
import { CronJob } from 'cron';
import apiClient from '../services/apiClient';
import logger from '../utils/logger';

export default {
  name: '/bdayNotify',
  description: 'Daily birthday notification cron job',
  async execute(client: Client): Promise<void> {
    try {
      new CronJob('0 6 * * *', async () => {
        const mm = new Date().getMonth() + 1;
        const dd = new Date().getDate();

        try {
          const users = await apiClient.getBdayUser(dd, mm);
          
          if (Array.isArray(users) && users.length > 0) {
            for (const user of users) {
              try {
                const extUser = await apiClient.getExtUserData(user._id);
                const avatar = extUser.discord.avatar.split('/').pop();

                if (avatar !== 'null.png') {
                  const successPost = new EmbedBuilder()
                    .setColor('#28a745')
                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                    .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${extUser.name}** - <@${extUser._id}>\n> $bday | #general | ${extUser._id}\n.`)
                    .setFooter({ text: 'Copy & Paste the command to generate Birthday Day Wish' });

                  const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
                  if (targetChannel && 'send' in targetChannel) {
                    await targetChannel.send({ embeds: [successPost] });
                  }
                } else {
                  const errorPost = new EmbedBuilder()
                    .setColor('#c25827')
                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                    .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${extUser.name}** - <@${extUser._id}>\n> Department: ${extUser.name}\n.`)
                    .addFields({
                      name: ':warning:   Urgent Notification   :warning:',
                      value: `.\nInform <@${extUser._id}> to update profile pic, so that he/she can have a **Birthday Wish Card**, the next year!`,
                    })
                    .setFooter({ text: 'Unfortunately, Birthday Wish Card can\'t be generated!' });

                  const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
                  if (targetChannel && 'send' in targetChannel) {
                    await targetChannel.send({ embeds: [errorPost] });
                  }
                }
              } catch (error) {
                logger.error('Error processing birthday user:', error);
              }
            }
          } else {
            const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
            if (targetChannel && 'send' in targetChannel) {
              await targetChannel.send('Well, it seems that no one here is celebrating their birthday today!');
            }
          }
        } catch (error) {
          logger.error('Error in birthday notification job:', error);
        }
      }, null, true, 'Asia/Kolkata');

      logger.info(`Birthday notification cron job started`);

    } catch (error) {
      logger.error('Failed to start birthday notification job:', error);
    }
  },
}; 