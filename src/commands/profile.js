module.exports = {
  metadata: {
    name: '/profile',
    description: 'Edit user profile',
    permissions: [],
    cooldown: 30,
    requiresDM: true,
  },

  async execute(_client, message) {
    try {
      const welcomeReply = await message.reply(`Welcome <@${message.author.id}> to Inovus Profiles!`);
      setTimeout(() => welcomeReply.delete().catch(() => {}), 25000);

      const formReply = await message.reply(
        `Please fill this form:\nhttps://docs.google.com/forms/d/e/1FAIpQLSf6PhcChyLvzUKmqkQG5QpEuZqUsSjQJo1yOcmMy54grL3Zmg/viewform?usp=pp_url&entry.633738056=${message.author.id}\n\nThis message will be deleted in 25 seconds.`
      );
      setTimeout(() => formReply.delete().catch(() => {}), 25000);
    } catch (error) {
      console.error('Failed to execute profile command:', error);
      await message.reply('An error occurred while processing your profile update.');
    }
  },

  validate() {
    return true;
  },
};
