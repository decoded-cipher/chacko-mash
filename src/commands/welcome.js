module.exports = {
  metadata: {
    name: '/welcome',
    description: 'Welcome new members',
    permissions: [],
    requiresGuild: true,
  },

  async execute(client, guildMember) {
    try {
      const welcomeImages = [
        'https://user-images.githubusercontent.com/44474792/126882769-2c86e588-8172-4c76-b41c-d8a0db5bdb56.png',
        'https://user-images.githubusercontent.com/44474792/126882807-2f2646a8-c984-472f-b0b5-f7a063958b6a.jpg',
        'https://user-images.githubusercontent.com/44474792/126882789-e8482f11-cb5b-4e8f-86ea-4ec5184c2db6.jpg',
        'https://user-images.githubusercontent.com/44474792/126882790-76c2109a-df80-4971-8741-ae3b42c78b23.jpg',
      ];

      const randomIndex = Math.floor(Math.random() * welcomeImages.length);
      const lobbyChannel = client.channels.cache.get(process.env.LOBBY_CHANNEL || '');

      if (lobbyChannel && 'send' in lobbyChannel) {
        await lobbyChannel.send(`Welcome <@${guildMember.user.id}> to Inovus Labs IEDC Discord Server!`);
        await lobbyChannel.send({ files: [welcomeImages[randomIndex]] });
      }

      const welcomeRole = process.env.WELCOME_ROLE;
      if (welcomeRole) await guildMember.roles.add(welcomeRole);

      const dmMessage = `:tada: Welcome to **Inovus Labs**!\n\nPlease fill this form:\nhttps://docs.google.com/forms/d/e/1FAIpQLSeXyH_5QqA8hYPems_uDvljsqjBadrSFuQ1NwdoubkOTV31WA/viewform?usp=pp_url&entry.1728088991=${guildMember.user.id}`;
      await guildMember.user.send(dmMessage);
    } catch (error) {
      console.error('Failed to execute welcome command:', error);
    }
  },

  validate(args) {
    return args.length >= 1 ? true : 'Welcome command requires a guild member';
  },
};
