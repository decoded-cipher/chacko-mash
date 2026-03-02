const imageGenerator = require('../utils/imageGenerator');
const apiClient = require('../services/apiClient');
const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '$birthday',
    description: 'Generate birthday wishes and images',
    usage: '$birthday | <#channel_id> | <user_id>',
    examples: ['$birthday | #general | 123456789'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: false,
    aliases: ['$bday', '$birthday-wish'],
    requiresGuild: true,
    requiresDM: false,
  },

  async execute(client, message, targetChannel, userId) {
    try {
      const userData = await apiClient.getExtUserData(userId);
      logger.command('birthday', userData._id);

      const imagePath = await imageGenerator.generateBirthdayImage(userData);
      const channel = client.channels.cache.get(targetChannel);

      if (!channel) throw new Error(`Target channel ${targetChannel} not found`);

      await channel.send(`Happy birthday <@${userData._id}>!`);
      await channel.send('https://tenor.com/view/simhavalan-menon-jagathy-malayalam-happy-birthday-santhosha-janmadinam-kuttikku-gif-17580455');
      await channel.send({ files: [imagePath] });

      logger.success(`Birthday command executed for ${userData.name}`);
      await message.reply('Birthday wish generated successfully!');
    } catch (error) {
      logger.errorWithContext('Failed to execute birthday command', error);
      await message.reply('Failed to process birthday command. User may not exist in the database.');
    }
  },

  validate(args) {
    if (args.length < 2) return 'Birthday command requires channel ID and user ID';
    return true;
  },
};
