import { Client, Message, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger';

export default {
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
  
  async execute(client: Client, message: Message): Promise<void> {
    try {
      // Check permissions
      if (!message.member || !this.hasPermission(message.member)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ **Access Denied**')
          .setDescription('```diff\n- You do not have permission to use this command\n- Required: Priority role access\n```')
          .setTimestamp();
        
        await message.reply({ embeds: [errorEmbed] });
        return;
      }

      // Create initial embed for "Pinging..." message
      const loadingEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🏓 **Pinging...**')
        .setDescription('```ml\nChecking bot latency and system status...\n```')
        .setTimestamp();

      // Add footer with iconURL only if available
      const botAvatar = client.user?.displayAvatarURL();
      if (botAvatar) {
        loadingEmbed.setFooter({ text: 'Latency Check in Progress', iconURL: botAvatar });
      } else {
        loadingEmbed.setFooter({ text: 'Latency Check in Progress' });
      }

      const sent = await message.reply({ embeds: [loadingEmbed] });
      const latency = sent.createdTimestamp - message.createdTimestamp;
      
      // Calculate essential metrics
      const uptime = client.uptime || 0;
      const memoryUsage = process.memoryUsage();
      const guildCount = client.guilds.cache.size;
      const userCount = client.users.cache.size;
      const channelCount = client.channels.cache.size;
      
      // Get command count dynamically
      const commandCount = this.getCommandCount(client);
      
      // Get environment info
      const environment = process.env.ENV || 'UNKNOWN';
      
      // Format uptime
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
      
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      
      // Determine status and color
      let status, color, statusEmoji, performanceLevel;
      if (latency < 50) {
        status = 'Excellent';
        color = 0x00FF00;
        statusEmoji = '🟢';
        performanceLevel = 'Ultra Fast';
      } else if (latency < 100) {
        status = 'Very Good';
        color = 0x90EE90;
        statusEmoji = '🟢';
        performanceLevel = 'Very Fast';
      } else if (latency < 200) {
        status = 'Good';
        color = 0xFFFF00;
        statusEmoji = '🟡';
        performanceLevel = 'Fast';
      } else if (latency < 500) {
        status = 'Fair';
        color = 0xFFA500;
        statusEmoji = '🟠';
        performanceLevel = 'Moderate';
      } else {
        status = 'Poor';
        color = 0xFF0000;
        statusEmoji = '🔴';
        performanceLevel = 'Slow';
      }

      // Create final embed with balanced results
      const resultEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${statusEmoji} **Pong!** ${statusEmoji}`)
        .setDescription(`**System Status Report** - ${new Date().toLocaleString()}`)
        .addFields(
          { 
            name: '📡 **Network Performance**', 
            value: `\`\`\`ml\nBot Latency: ${latency}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms\nTotal Round Trip: ${latency + Math.round(client.ws.ping)}ms\`\`\``, 
            inline: false 
          },
          { 
            name: '⚡ **Performance Status**', 
            value: `\`\`\`fix\n${status} (${statusEmoji})\nLevel: ${performanceLevel}\nQuality: ${this.getConnectionQuality(latency)}\`\`\``, 
            inline: true 
          },
          { 
            name: '⏱️ **Uptime**', 
            value: `\`\`\`ml\nBot: ${uptimeString}\nProcess: ${this.formatUptime(process.uptime())}\nEnvironment: ${environment}\`\`\``, 
            inline: true 
          },
          { 
            name: '💾 **Memory Usage**', 
            value: `\`\`\`ml\nRSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB\nHeap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB\nUsage: ${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%\`\`\``, 
            inline: false 
          },
          { 
            name: '🌐 **Bot Statistics**', 
            value: `\`\`\`ml\nServers: ${guildCount}\nUsers: ${userCount}\nChannels: ${channelCount}\nCommands: ${commandCount}\nStatus: Online\`\`\``, 
            inline: false 
          }
        )
        .setTimestamp();

      // Add footer with iconURL only if available
      const userAvatar = message.author.displayAvatarURL();
      if (userAvatar) {
        resultEmbed.setFooter({ 
          text: `Requested by ${message.author.username} • ${client.user?.username || 'Bot'} • ${this.getConnectionQuality(latency)}`, 
          iconURL: userAvatar
        });
      } else {
        resultEmbed.setFooter({ 
          text: `Requested by ${message.author.username} • ${client.user?.username || 'Bot'} • ${this.getConnectionQuality(latency)}`
        });
      }

      // Add thumbnail if bot avatar is available
      if (botAvatar) {
        resultEmbed.setThumbnail(botAvatar);
      }

      // Add performance bar
      const performanceBar = this.createPerformanceBar(latency);
      resultEmbed.addFields({
        name: '📊 **Performance Bar**',
        value: performanceBar,
        inline: false
      });

      // Add system health indicator
      const healthIndicator = this.getSystemHealthIndicator(memoryUsage, latency);
      resultEmbed.addFields({
        name: '🏥 **System Health**',
        value: healthIndicator,
        inline: false
      });

      // Add deployment info if on Render
      if (process.env.RENDER) {
        resultEmbed.addFields({
          name: '🚀 **Deployment Info**',
          value: `\`\`\`ml\nPlatform: Render\nService: ${process.env.RENDER_SERVICE_NAME || 'Unknown'}\nRegion: ${process.env.RENDER_REGION || 'Unknown'}\nEnvironment: ${environment}\`\`\``,
          inline: false
        });
      }
      
      await sent.edit({ embeds: [resultEmbed] });
      
      logger.info('Ping command executed', {
        userId: message.author.id,
        username: message.author.username,
        guildId: message.guild?.id,
        guildName: message.guild?.name,
        latency: latency,
        apiLatency: Math.round(client.ws.ping),
        status: status,
        guildCount: guildCount,
        userCount: userCount,
        commandCount: commandCount,
        memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        environment: environment
      });
      
    } catch (error) {
      logger.errorWithContext('Failed to execute ping command', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ **Error Occurred**')
        .setDescription('```diff\n- Failed to check bot latency\n- Please try again later\n```')
        .addFields({
          name: '🔧 **Troubleshooting**',
          value: '```ml\n1. Check bot permissions\n2. Verify network connection\n3. Contact administrator if issue persists\n4. Check system resources\n5. Verify Discord API status\n```',
          inline: false
        })
        .setTimestamp();

      // Add footer with iconURL only if available
      const botAvatar = client.user?.displayAvatarURL();
      if (botAvatar) {
        errorEmbed.setFooter({ text: 'Error Report', iconURL: botAvatar });
      } else {
        errorEmbed.setFooter({ text: 'Error Report' });
      }
        
      await message.reply({ embeds: [errorEmbed] });
    }
  },

  hasPermission(member: any): boolean {
    return member.roles.cache.some(
      (role: any) => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
    );
  },

  createPerformanceBar(latency: number): string {
    const maxLatency = 1000;
    const barLength = 20;
    const percentage = Math.min(latency / maxLatency, 1);
    const filledLength = Math.round(barLength * percentage);
    
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(barLength - filledLength);
    
    return `\`\`\`ml\n[${filled}${empty}] ${latency}ms\`\`\``;
  },

  getConnectionQuality(latency: number): string {
    if (latency < 50) return 'Premium';
    if (latency < 100) return 'Excellent';
    if (latency < 200) return 'Good';
    if (latency < 500) return 'Fair';
    return 'Poor';
  },

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  },

  getSystemHealthIndicator(memoryUsage: NodeJS.MemoryUsage, latency: number): string {
    const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const memoryHealth = heapUsagePercent < 80 ? '🟢' : heapUsagePercent < 90 ? '🟡' : '🔴';
    const latencyHealth = latency < 200 ? '🟢' : latency < 500 ? '🟡' : '🔴';
    
    return `\`\`\`ml\nMemory: ${memoryHealth} ${Math.round(heapUsagePercent)}%\nLatency: ${latencyHealth} ${latency}ms\nOverall: ${heapUsagePercent < 80 && latency < 200 ? '🟢' : '🟡'}\`\`\``;
  },

  getCommandCount(client: Client): number {
    try {
      // Access the DiscordBot instance through the global client
      const discordBot = (global as any).discordBot;
      if (discordBot && discordBot.getCommands) {
        const commands = discordBot.getCommands();
        return commands.length;
      }
      
      // Fallback: try to access through client
      if ((client as any).discordBot && (client as any).discordBot.getCommands) {
        const commands = (client as any).discordBot.getCommands();
        return commands.length;
      }
      
      // Final fallback
      return 15; // Placeholder if we can't access the command registry
    } catch (error) {
      logger.warn('Could not get command count dynamically, using fallback');
      return 15; // Fallback value
    }
  },
  
  validate(_args: any[]): boolean | string {
    // Ping command doesn't require any arguments
    return true;
  },
}; 