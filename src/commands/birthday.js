const imageGenerator = require('../utils/imageGenerator');
const d1Client = require('../services/d1Client');

module.exports = {
  metadata: {
    name: '$bday',
    description: 'Generate birthday wishes and images',
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 10,
    requiresGuild: true,
  },

  async execute(client, message, targetChannel, userId) {
    try {
      if (!d1Client.ready) throw new Error('D1 database not configured');

      const student = await d1Client.getStudentByDiscordId(userId);
      if (!student) throw new Error('User not found in database');

      const discordUser = await client.users.fetch(userId).catch(() => null);
      if (!discordUser) throw new Error('Could not fetch Discord user');

      const userData = d1Client.toImageGeneratorUserData(student, discordUser);
      const imagePath = await imageGenerator.generateBirthdayImage(userData);
      const channel = client.channels.cache.get(targetChannel);

      if (!channel) throw new Error(`Target channel ${targetChannel} not found`);

      await channel.send(`Happy birthday <@${userId}>!`);
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
