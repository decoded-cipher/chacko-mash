import { Client, User, EmbedBuilder } from 'discord.js';
import { HacktoberfestData } from '../types';
import apiClient from '../services/apiClient';
import imageGenerator from '../utils/imageGenerator';
import emailService from '../utils/emailService';

export default {
  name: '/hacktoberfest',
  description: 'Process hacktoberfest certificate generation',
  async execute(client: Client, _message: any, _reaction: any, user: User): Promise<void> {
    try {
      console.log('Processing hacktoberfest command', { userId: user.id });

      // Get existing certificates
      const certificates = await apiClient.getHacktoberfestData();
      const certificateArray = Array.isArray(certificates) ? certificates : [];

      // Prepare certificate data
      const certificateId = `INO2022HBF${(certificateArray.length + 1).toString().padStart(3, '0')}`;
      const data: HacktoberfestData = {
        id: user.id,
        certificateId,
      };

      // Get user data
      const userData = await apiClient.getExtUserData(data.id);
      data.name = userData.name;
      data.email = userData.email;

      // Generate certificate
      await imageGenerator.generateHacktoberfestCertificate({
        name: data.name || '',
        certificateId: data.certificateId,
      });

      // Post data to API
      await apiClient.postHacktoberfestData({
        id: data.id,
        certificateId: data.certificateId,
      });

      // Send email
      await emailService.sendHacktoberfestEmail(data);

      // Create embeds
      const serverEmbed = new EmbedBuilder()
        .setColor('#9092ff')
        .setTitle(':cloud_lightning:   Hacktoberfest Certificate Initiated   :cloud_lightning:')
        .setDescription(`Dear **${data.name}**,\nThanks for your open-source contribution to one of our repositories during this **Hacktoberfest Season**. :sparkles:\n\n> Your **Certificate of Contribution** has been emailed. For more details, check the DM with me.`)
        .setFooter({ text: 'Happy Hacktober Kiddos!' });

      const userEmbed = new EmbedBuilder()
        .setColor('#9092ff')
        .setTitle(':cloud_lightning:   Hacktoberfest 2022 | Inovus Labs IEDC   :cloud_lightning:')
        .setDescription(`** **\nHurray!\nYou have successfully contributed to an Open-source Repository maintained by **Inovus Labs** during this **Hacktoberfest** Season.  :sparkles:\n\nA small token of appreciation in the format of a **Certificate of Contribution** has been sent to the below-mentioned Email Address.  :sparkles:\n\n> Name : **${data.name}**\n> Email : **${data.email}**\n\n> Certificate ID : **${data.certificateId}**\n\nIf the certificate is not received in 15 minutes, contact the **Server Moderator** or **X-Men**.\n\n\n** **`)
        .setFooter({ text: 'I\'m a bot, don\'t reply to me.' });

      // Send messages
      const hfChannel = client.channels.cache.get(process.env.HF_CHANNEL || '');
      if (hfChannel && 'send' in hfChannel) {
        await hfChannel.send({ embeds: [serverEmbed] });
      }

      const discordUser = client.users.cache.get(data.id);
      if (discordUser) {
        await discordUser.send({ embeds: [userEmbed] });
      }

      console.log('Hacktoberfest command executed successfully', {
        userId: data.id,
        certificateId: data.certificateId,
        name: data.name,
      });
    } catch (error) {
      console.error('Failed to execute hacktoberfest command:', error);
      throw error;
    }
  },
}; 