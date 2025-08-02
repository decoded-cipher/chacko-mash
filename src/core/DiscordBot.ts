import { Client, Collection, Message, MessageReaction, User } from 'discord.js';
import { readdir } from 'fs/promises';
import path from 'path';
import { Command } from '../types';
import logger from '../utils/logger';

class DiscordBot {
  public client: Client;
  public commands: Collection<string, Command>;
  private readonly prefix = '$';

  constructor() {
    this.client = new Client({
      intents: [
        'Guilds',
        'GuildMessages',
        'GuildMembers',
        'MessageContent',
        'DirectMessages',
      ],
    });

    this.commands = new Collection();
  }

  async initialize(): Promise<void> {
    try {
      logger.section('Discord Bot Initialization');
      await this.loadCommands();
      await this.client.login(process.env.DISCORDJS_BOT_TOKEN);
      logger.success('Discord bot initialized successfully');
    } catch (error) {
      logger.errorWithContext('Failed to initialize Discord bot', error);
      throw error;
    }
  }

  private async loadCommands(): Promise<void> {
    try {
      const commandsPath = path.join(__dirname, '../commands');
      const commandFiles = await readdir(commandsPath);

      for (const file of commandFiles) {
        // Skip non-command files
        if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
        if (file.startsWith('.') || file.includes('.d.ts')) continue;

        try {
          const command = await import(path.join(commandsPath, file));
          if (command.default && command.default.name && command.default.execute) {
            this.commands.set(command.default.name, command.default);
            logger.info(`Loaded command: ${command.default.name}`);
          } else {
            logger.warn(`Skipping invalid command file: ${file}`);
          }
        } catch (importError) {
          logger.error(`Failed to import command file ${file}:`, importError);
        }
      }

      logger.success(`Loaded ${this.commands.size} commands`);
    } catch (error) {
      logger.errorWithContext('Failed to load commands', error);
      throw error;
    }
  }

  async handleMessage(message: Message): Promise<void> {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      // Handle DM messages
      if (!message.guild) {
        await this.handleDirectMessage(message);
        return;
      }

      // Handle guild messages with prefix
      if (message.content.startsWith(this.prefix)) {
        await this.handlePrefixedCommand(message);
        return;
      }

      // Handle slash commands
      if (message.content.startsWith('/')) {
        await this.handleSlashCommand(message);
        return;
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      try {
        await message.reply('An error occurred while processing your command.');
      } catch (replyError) {
        logger.error('Failed to send error reply:', replyError);
      }
    }
  }

  private async handleDirectMessage(message: Message): Promise<void> {
    if (message.content.startsWith('/edit-profile')) {
      const command = this.commands.get('/profile');
      if (command) {
        await command.execute(this.client, message);
      }
    } else {
      // Forward DM to target channel
      const targetChannel = this.client.channels.cache.get(process.env.TARGET_CHANNEL || '');
      if (targetChannel && 'send' in targetChannel) {
        const embed = {
          color: 0x4b9fc3,
          author: {
            name: message.author.username,
            icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
          },
          description: message.content,
          footer: {
            text: new Date().toString(),
          },
        };
        await targetChannel.send({ embeds: [embed] });
      }
    }
  }

  private async handlePrefixedCommand(message: Message): Promise<void> {
    try {
      // Check permissions
      const hasPermission = message.member?.roles.cache.some(
        role => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
      );

      if (!hasPermission) {
        await message.reply(`You are not allowed to use this command. Please contact <@&${process.env.PRIORITY_ROLE_01}> for more details.`);
        return;
      }

      const [cmdName, targetChannel, ...args] = message.content
        .trim()
        .substring(this.prefix.length)
        .split(' | ');

      const cleanTargetChannel = targetChannel?.replace(/[^0-9\s]/g, '') || '';

      if (cmdName) {
        logger.command(cmdName, message.author.id);
      }

      switch (cmdName) {
        case 'bot':
          await this.handleBotCommand(message, cleanTargetChannel, args.join(' '));
          break;
        case 'bday':
          await this.handleBirthdayCommand(message, cleanTargetChannel, args.join(' '));
          break;
        case 'role':
          await this.handleRoleCommand(message, cleanTargetChannel, args.join(' '));
          break;
        case 'dm':
          await this.handleDmCommand(message, cleanTargetChannel, args.join(' '));
          break;
        default:
          await message.reply('Invalid command format. Use `/help` to see available commands.');
      }
    } catch (error) {
      logger.errorWithContext('Error handling prefixed command', error);
      await message.reply('An error occurred while processing your command.');
    }
  }

  private async handleSlashCommand(message: Message): Promise<void> {
    const commandName = message.content.split(' ')[0];
    if (!commandName) return;
    
    const command = this.commands.get(commandName);

    if (command) {
      logger.command(commandName, message.author.id);
      await command.execute(this.client, message);
    } else {
      logger.warn(`Command not found: ${commandName}`);
      await message.reply(`Command \`${commandName}\` not found. Use \`/help\` to see available commands.`);
    }
  }

  private async handleBotCommand(_message: Message, targetChannel: string, content: string): Promise<void> {
    const channel = this.client.channels.cache.get(targetChannel);
    if (channel && 'send' in channel) {
      await channel.send(content);
    }
  }

  private async handleBirthdayCommand(message: Message, targetChannel: string, userId: string): Promise<void> {
    try {
      const apiClient = await import('../services/apiClient');
      const userData = await apiClient.default.getExtUserData(userId);
      const command = this.commands.get('/birthday');
      if (command) {
        await command.execute(this.client, targetChannel, userData);
      }
    } catch (error) {
      logger.error('Birthday command error:', error);
      await message.reply('Failed to process birthday command.');
    }
  }

  private async handleRoleCommand(message: Message, targetChannel: string, args: string): Promise<void> {
    const command = this.commands.get('/roles');
    if (command) {
      await command.execute(this.client, message, targetChannel, args);
    }
  }

  private async handleDmCommand(message: Message, targetChannel: string, args: string): Promise<void> {
    const command = this.commands.get('/dmUser');
    if (command) {
      await command.execute(this.client, message, targetChannel, args);
    }
  }

  async handleReaction(reaction: MessageReaction, user: User): Promise<void> {
    try {
      if (reaction.message.channel?.id === process.env.HF_CHANNEL && reaction.emoji.name === 'hacktoberfest') {
        const member = reaction.message.guild?.members.cache.get(user.id);
        const hasPermission = member?.roles.cache.some(
          (role: any) => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
        );

        if (!hasPermission) {
          await reaction.users.remove(user.id);
          await user.send(`You are not allowed to use this reaction in <#${process.env.HF_CHANNEL}> channel.`);
          return;
        }

        if (reaction.count === 1) {
          const command = this.commands.get('/hacktoberfest');
          if (command) {
            await command.execute(this.client, reaction.message, reaction, user);
          }
        } else {
          await reaction.users.remove(user.id);
          await user.send('This message is already verified by an X-Men or the Server Moderator.');
        }
      }
    } catch (error) {
      logger.error('Error handling reaction:', error);
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.client.destroy();
      logger.info('Discord bot shutdown successfully');
    } catch (error) {
      logger.error('Error during Discord bot shutdown:', error);
    }
  }
}

export default DiscordBot; 