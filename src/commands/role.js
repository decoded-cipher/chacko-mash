module.exports = {
  metadata: {
    name: '$role',
    description: 'Assign role to users',
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 5,
    enabled: false,
    requiresGuild: true,
  },

  async execute(client, message, targetRole, users) {
    try {
      if (!message.guild) {
        await message.reply('This command can only be used in a server.');
        return;
      }

      const role = message.guild.roles.cache.find((r) => r.id === targetRole);
      if (!role) {
        await message.reply('Role not found.');
        return;
      }

      const userList = users.split(/\s+/);
      let successCount = 0;
      let failCount = 0;

      for (const user of userList) {
        const userId = user.replace(/[^0-9]/g, '');
        const member = message.guild.members.cache.get(userId);
        if (member) {
          try {
            await member.roles.add(role);
            successCount++;
            const targetChannel = client.channels.cache.get(process.env.TARGET_CHANNEL || '');
            if (targetChannel && 'send' in targetChannel) {
              await targetChannel.send(`<@${userId}> has been given the role <@&${role.id}>`);
            }
          } catch (err) {
            failCount++;
          }
        } else {
          failCount++;
        }
      }

      await message.reply(`Role assignment completed. Success: ${successCount}, Failed: ${failCount}`);
    } catch (error) {
      console.error('Failed to execute role command:', error);
      await message.reply('An error occurred while managing roles.');
    }
  },

  validate(args) {
    if (args.length < 2) return 'Role command requires role ID and at least one user';
    return true;
  },
};
