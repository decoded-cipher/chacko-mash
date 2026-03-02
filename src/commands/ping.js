const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  metadata: {
    name: '/ping',
    description: 'Check bot latency and response time',
    usage: '/ping',
    examples: ['/ping'],
    permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02'],
    cooldown: 3,
    enabled: true,
    aliases: ['/latency', '/p'],
    requiresGuild: true,
    requiresDM: false,
  },

  async execute(client, message) {
    try {
      if (!message.member || !message.member.roles.cache.some((r) => r.id === process.env.PRIORITY_ROLE_01 || r.id === process.env.PRIORITY_ROLE_02)) {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ **Access Denied**')
              .setDescription('```diff\n- You do not have permission to use this command\n```')
              .setTimestamp(),
          ],
        });
        return;
      }

      const loadingEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🏓 **Pinging...**')
        .setTimestamp();

      const sent = await message.reply({ embeds: [loadingEmbed] });
      const latency = sent.createdTimestamp - message.createdTimestamp;

      const uptime = client.uptime || 0;
      const memoryUsage = process.memoryUsage();
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      let status, color, statusEmoji;
      if (latency < 50) {
        status = 'Excellent';
        color = 0x00ff00;
        statusEmoji = '🟢';
      } else if (latency < 100) {
        status = 'Very Good';
        color = 0x90ee90;
        statusEmoji = '🟢';
      } else if (latency < 200) {
        status = 'Good';
        color = 0xffff00;
        statusEmoji = '🟡';
      } else if (latency < 500) {
        status = 'Fair';
        color = 0xffa500;
        statusEmoji = '🟠';
      } else {
        status = 'Poor';
        color = 0xff0000;
        statusEmoji = '🔴';
      }

      const discordBot = global.discordBot;
      const commandCount = discordBot?.getCommands ? discordBot.getCommands().length : 15;

      const resultEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${statusEmoji} **Pong!** ${statusEmoji}`)
        .setDescription(`**System Status** - ${new Date().toLocaleString()}`)
        .addFields(
          { name: '📡 **Latency**', value: `\`\`\`${latency}ms (API: ${Math.round(client.ws.ping)}ms)\`\`\``, inline: true },
          { name: '⏱️ **Uptime**', value: `\`\`\`${uptimeString}\`\`\``, inline: true },
          { name: '💾 **Memory**', value: `\`\`\`${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB\`\`\``, inline: true },
          { name: '🌐 **Stats**', value: `\`\`\`Servers: ${client.guilds.cache.size} | Users: ${client.users.cache.size} | Commands: ${commandCount}\`\`\``, inline: false }
        )
        .setTimestamp();

      await sent.edit({ embeds: [resultEmbed] });
      logger.info('Ping command executed', { userId: message.author.id, latency });
    } catch (error) {
      logger.errorWithContext('Failed to execute ping command', error);
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ **Error**')
            .setDescription('Failed to check latency.')
            .setTimestamp(),
        ],
      });
    }
  },

  validate() {
    return true;
  },
};
