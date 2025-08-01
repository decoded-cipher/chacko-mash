import { Client, TextChannel } from 'discord.js';
import { UserData } from '../types';
import imageGenerator from '../utils/imageGenerator';

export default {
  name: '/birthday',
  description: 'Generate birthday wishes and images',
  async execute(client: Client, targetChannel: string, userData: UserData): Promise<void> {
    try {
      console.log('Processing birthday command', { userId: userData._id, name: userData.name });

      // Generate birthday image using the separate service
      const imagePath = await imageGenerator.generateBirthdayImage(userData);

      // Send birthday messages
      const channel = client.channels.cache.get(targetChannel) as TextChannel;
      if (!channel) {
        throw new Error(`Target channel ${targetChannel} not found`);
      }

      await channel.send(`"This birthday, I wish you abundant happiness and love. May all your dreams turn into reality and may lady luck visit your home today. Happy birthday <@${userData._id}>."`);
      await channel.send('https://tenor.com/view/simhavalan-menon-jagathy-malayalam-happy-birthday-santhosha-janmadinam-kuttikku-gif-17580455');
      await channel.send({ files: [imagePath] });

      const age = new Date().getFullYear() - userData.dob.year;
      console.log('Birthday command executed successfully', { 
        userId: userData._id, 
        channel: targetChannel,
        age: age
      });
    } catch (error) {
      console.error('Failed to execute birthday command:', error);
      throw error;
    }
  },
}; 