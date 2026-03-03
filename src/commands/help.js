const { EmbedBuilder } = require('discord.js');

module.exports = {
  metadata: {
    name: '/help',
    description: 'Show available commands',
    permissions: [],
    cooldown: 5,
  },

  async execute(_client, message) {
    try {
      const allCommands = [
        {
          name: 'customMessage',
          color: '#f7ff2c',
          title: ':newspaper:   Custom Message in a Channel',
          description: '**$bot | <#channel_id> | <Enter the message>**\n\nTo post notifications or announcements by **InoBot** in any specified channel.',
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
        },
        {
          name: 'dmServerMember',
          color: '#2cd5ff',
          title: ':envelope_with_arrow:   DM Server Role(s) or User(s)',
          description: '**$dm | <user_id/role_id> | <Enter the message>**\n\nTo send a **Direct Message** to any role(s) or users.',
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
        },
        {
          name: 'assignRole',
          color: '#9b59b6',
          title: ':busts_in_silhouette:   Assign Role to Users',
          description: '**$role | <role_id> | <user_1> <user_2> ...**\n\nTo assign a role to one or more users.',
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
        },
        {
          name: 'birthday',
          color: '#e74c3c',
          title: ':birthday:   Generate Birthday Wish',
          description: '**$bday** | <#channel_id> | <user_id>\n\nTo generate a birthday wish image and post in a channel.',
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
        },
        {
          name: 'ping',
          color: '#00ff00',
          title: ':ping_pong:   Check Bot Latency',
          description: '**/ping**\n\nCheck bot latency and system status.',
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
        },
        {
          name: 'editProfile',
          color: '#2c2cff',
          title: ':page_facing_up:   Update Inovus Profiles',
          description: 'Type **/profile** in DM to <@842062518675439617> to update your Inovus Profile.',
          permissions: [],
        },
        // {
        //   name: 'hacktoberfest',
        //   color: '#9092ff',
        //   title: ':cloud_lightning:   Hacktoberfest Certificate',
        //   description: 'React with the **hacktoberfest** emoji on a message in the designated HF channel to request your certificate of contribution.',
        //   permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
        // },
      ];

      let userRoleIds = [];
      if (message.guild && message.member) {
        userRoleIds = message.member?.roles.cache.map((role) => role.id) || [];
      }

      const accessibleCommands = allCommands.filter((command) => {
        if (!command.permissions?.length) return true;
        return command.permissions.some((permission) => {
          if (permission === 'PRIORITY_ROLE_01') return userRoleIds.includes(process.env.PRIORITY_ROLE_01 || '');
          if (permission === 'PRIORITY_ROLE_02') return userRoleIds.includes(process.env.PRIORITY_ROLE_02 || '');
          return false;
        });
      });

      if (accessibleCommands.length === 0) {
        const noAccessEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ No Commands Available')
          .setDescription("You don't have access to any commands at the moment.")
          .setTimestamp();
        if ('send' in message.channel) await message.channel.send({ embeds: [noAccessEmbed] });
        return;
      }

      for (const command of accessibleCommands) {
        const commandEmbed = new EmbedBuilder()
          .setColor(command.color)
          .setTitle(command.title)
          .setDescription(command.description)
          .setTimestamp();
        if ('send' in message.channel) await message.channel.send({ embeds: [commandEmbed] });
      }
    } catch (error) {
      console.error('Failed to execute help command:', error);
      await message.reply('An error occurred while displaying help information.');
    }
  },

  validate() {
    return true;
  },
};
