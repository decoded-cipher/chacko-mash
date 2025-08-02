import { Client, Message, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '/help',
    description: 'Show available commands',
    category: 'Utility',
    usage: '/help [category]',
    examples: ['/help', '/help Utility', '/help Admin'],
    permissions: [],
    cooldown: 5,
    enabled: true,
    aliases: ['/h', '/commands'],
    requiresGuild: false,
    requiresDM: false,
  },
  async execute(_client: Client, message: Message, _category?: string): Promise<void> {
    try {
      // Define all available commands with their metadata
      const allCommands = [
        {
          name: "customMessage",
          color: "#f7ff2c",
          title: ":newspaper:   Custom Message in a Channel",
          description: "**$bot | <#channel_id> | <Enter the message>**\n\nTo post notifications or announcements by **InoBot** in any specified channel. This command can only be executed from a channel where **InoBot** has enough permissions.",
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02']
        }, {
          name: "bdayWish",
          color: "#ff2cda",
          title: ":birthday:   Generate Birthday Wish",
          description: "**$bday | <#channel_id> | <user_id>**\n\nTo post a birthday wish by **InoBot** in any specified channel. This will also generate a custom unique **Birthday Wish Card**.",
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02']
        }, {
          name: "assignRole",
          color: "#ff702c",
          title: ":crown:   Assign Server Roles",
          description: "**$role | <@role_id> | <@user_01> <@user_02>**\n\nTo assign a role to any no: of users at the same time by **InoBot**.  This command will notify the role assignment in <#883465290556530748> channel & DM respective users about their new role.",
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02']
        }, {
          name: "dmServerMember",
          color: "#2cd5ff",
          title: ":envelope_with_arrow:   DM Server Role(s) or User(s)",
          description: "**$dm | <@user_id> <@role_id> | <Enter the message>\n\n**To send a **Direct Message** to any role(s) or any no: of users at the same time by **InoBot**.  This command will also notify the message delivery in the <#883465290556530748> channel.",
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02']
        }, {
          name: "ping",
          color: "#00ff00",
          title: ":ping_pong:   Check Bot Latency",
          description: "**/ping**\n\nCheck bot latency and system status. Shows performance metrics and connection quality.",
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02']
        }, {
          name: "hacktoberfest",
          color: "#9092ff",
          title: ":cloud_lightning:   Hacktoberfest Certificate",
          description: "**/hacktoberfest**\n\nProcess hacktoberfest certificate generation and send via email.",
          permissions: ['PRIORITY_ROLE_01', 'PRIORITY_ROLE_02']
        }, {
          name: "editProfile",
          color: "#2c2cff",
          title: ":page_facing_up:   Update Inovus Profiles",
          description: "Type **/edit-profile**\n\nSend the message to <@842062518675439617> via DM. This command will update your **Inovus Profiles** or generates the profile if it doesn\'t exists.\n\n> Note :\n> You\'ll have to switch to the same **Google Account** that you have used to submit the **Google Form** initially, every time to **Edit the Response**.",
          permissions: []
        }
      ];

      // Get user's role IDs if in a guild
      let userRoleIds: string[] = [];
      if (message.guild && message.member) {
        userRoleIds = message.member?.roles.cache.map(role => role.id) || [];
      }

      // Filter commands based on user permissions
      const accessibleCommands = allCommands.filter(command => {
        // If command has no permissions, it's accessible to everyone
        if (!command.permissions || command.permissions.length === 0) {
          return true;
        }
        
        // Check if user has any of the required permissions by role ID
        return command.permissions.some(permission => {
          if (permission === 'PRIORITY_ROLE_01') {
            return userRoleIds.includes(process.env.PRIORITY_ROLE_01 || '');
          }
          if (permission === 'PRIORITY_ROLE_02') {
            return userRoleIds.includes(process.env.PRIORITY_ROLE_02 || '');
          }
          return false;
        });
      });

      // If no commands are accessible, show a message
      if (accessibleCommands.length === 0) {
        const noAccessEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ No Commands Available')
          .setDescription('You don\'t have access to any commands at the moment.')
          .setTimestamp();
        
        if ('send' in message.channel) {
          await message.channel.send({ embeds: [noAccessEmbed] });
        }
        return;
      }

      // Send separate embed for each accessible command
      for (const command of accessibleCommands) {
        const commandEmbed = new EmbedBuilder()
          .setColor(command.color as any)
          .setTitle(command.title)
          .setDescription(command.description)
          .setTimestamp();

        if ('send' in message.channel) {
          await message.channel.send({ embeds: [commandEmbed] });
        }
      }

      logger.command('help', message.author.id);

    } catch (error) {
      logger.errorWithContext('Failed to execute help command', error);
      await message.reply('An error occurred while displaying help information.');
    }
  },
  validate(_args: any[]): boolean | string {
    // Help command accepts optional category argument
    return true;
  },
}; 