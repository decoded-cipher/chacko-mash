import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  name: '/profile',
  description: 'Edit user profile',
  async execute(_client: Client, message: Message): Promise<void> {
    try {
      if (!message.guild) {
        await message.reply('This command can only be used in a server.');
        return;
      }

      const welcomeReply = await message.reply(`Welcome <@${message.author.id}> to Inovus Profiles!`);
      setTimeout(() => {
        welcomeReply.delete().catch(logger.error);
      }, 25000);

      const formReply = await message.reply(`Please make sure that you fill-up this form:\nhttps://docs.google.com/forms/d/e/1FAIpQLSf6PhcChyLvzUKmqkQG5QpEuZqUsSjQJo1yOcmMy54grL3Zmg/viewform?usp=pp_url&entry.633738056=${message.author.id}\n\n> You can update your profile by generating the link again.\n> This message will be deleted in 25 seconds.\n** **`);
      setTimeout(() => {
        formReply.delete().catch(logger.error);
      }, 25000);

      logger.info('Profile command executed', {
        userId: message.author.id,
        username: message.author.username
      });

    } catch (error) {
      logger.error('Failed to execute profile command:', error);
      await message.reply('An error occurred while processing your profile update.');
    }
  },
}; 