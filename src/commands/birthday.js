const imageGenerator = require('../utils/imageGenerator');
const apiClient = require('../services/apiClient');

module.exports = {
  metadata: {
    name: '$birthday',
    description: 'Generate birthday wishes and images',
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    enabled: false,
    requiresGuild: true,
  },

  async execute(client, message, targetChannel, userId) {
    try {
      const userData = await apiClient.getExtUserData(userId);
      const imagePath = await imageGenerator.generateBirthdayImage(userData);
      const channel = client.channels.cache.get(targetChannel);

      if (!channel) throw new Error(`Target channel ${targetChannel} not found`);

      await channel.send(`Happy birthday <@${userData._id}>!`);
      await channel.send('https://tenor.com/view/simhavalan-menon-jagathy-malayalam-happy-birthday-santhosha-janmadinam-kuttikku-gif-17580455');
      await channel.send({ files: [imagePath] });

      await message.reply('Birthday wish generated successfully!');
    } catch (error) {
      console.error('Failed to execute birthday command:', error);
      await message.reply('Failed to process birthday command. User may not exist in the database.');
    }
  },

  validate(args) {
    if (args.length < 2) return 'Birthday command requires channel ID and user ID';
    return true;
  },
};
