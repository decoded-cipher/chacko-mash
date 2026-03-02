const { EmbedBuilder } = require('discord.js');
const apiClient = require('../services/apiClient');
const imageGenerator = require('../utils/imageGenerator');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '/hacktoberfest',
    description: 'Process hacktoberfest certificate generation',
    usage: '/hacktoberfest',
    examples: ['/hacktoberfest'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 60,
    enabled: false,
    aliases: ['/hf', '/hacktober'],
    requiresGuild: true,
    requiresDM: false,
  },

  async execute(client, _message, _reaction, user) {
    try {
      const certificates = await apiClient.getHacktoberfestData();
      const certificateArray = Array.isArray(certificates) ? certificates : [];
      const certificateId = `INO2022HBF${(certificateArray.length + 1).toString().padStart(3, '0')}`;

      const userData = await apiClient.getExtUserData(user.id);
      const data = {
        id: user.id,
        certificateId,
        name: userData.name,
        email: userData.email,
      };

      await imageGenerator.generateHacktoberfestCertificate({ name: data.name || '', certificateId: data.certificateId });
      await apiClient.postHacktoberfestData({ id: data.id, certificateId: data.certificateId });
      await emailService.sendHacktoberfestEmail(data);

      const serverEmbed = new EmbedBuilder()
        .setColor('#9092ff')
        .setTitle(':cloud_lightning:   Hacktoberfest Certificate Initiated   :cloud_lightning:')
        .setDescription(`Dear **${data.name}**,\nYour **Certificate of Contribution** has been emailed.`)
        .setFooter({ text: 'Happy Hacktober!' });

      const userEmbed = new EmbedBuilder()
        .setColor('#9092ff')
        .setTitle(':cloud_lightning:   Hacktoberfest 2022   :cloud_lightning:')
        .setDescription(`Certificate sent to **${data.email}**\nCertificate ID: **${data.certificateId}**`)
        .setFooter({ text: "I'm a bot, don't reply to me." });

      const hfChannel = client.channels.cache.get(process.env.HF_CHANNEL || '');
      if (hfChannel && 'send' in hfChannel) await hfChannel.send({ embeds: [serverEmbed] });

      const discordUser = client.users.cache.get(data.id);
      if (discordUser) await discordUser.send({ embeds: [userEmbed] });

      logger.info('Hacktoberfest command executed', { userId: data.id, certificateId: data.certificateId });
    } catch (error) {
      logger.error('Failed to execute hacktoberfest command:', error);
      throw error;
    }
  },

  validate() {
    return true;
  },
};
