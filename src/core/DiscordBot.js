const { Client, GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');
const CommandRegistry = require('./CommandRegistry');
const CommandExecutor = require('./CommandExecutor');
const logger = require('../utils/logger');

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel],
    });
    const commandsPath = path.join(__dirname, '../commands');
    this.commandRegistry = new CommandRegistry(commandsPath);
    this.commandExecutor = new CommandExecutor(this.commandRegistry, '$');
    global.discordClient = this.client;
  }

  async initialize() {
    try {
      logger.section('Discord Bot Initialization');
      await this.commandRegistry.initialize();
      this.setupEventHandlers();
      await this.client.login(process.env.DISCORDJS_BOT_TOKEN);
      logger.success('Discord bot initialized successfully');
    } catch (error) {
      logger.errorWithContext('Failed to initialize Discord bot', error);
      throw error;
    }
  }

  setupEventHandlers() {
    this.client.on('messageCreate', async (message) => {
      try {
        if (message.author.bot) return;
        if (!message.guild) {
          logger.info(`DM from ${message.author.tag}: "${(message.content || '').slice(0, 50)}${(message.content || '').length > 50 ? '...' : ''}"`);
          if (!message.content || message.content.length === 0) {
            logger.warn('DM has empty content - enable "Message Content Intent" in Discord Developer Portal → Bot → Privileged Gateway Intents');
          }
          await this.commandExecutor.executeDirectMessage(message);
          return;
        }
        if (message.content.startsWith('$')) {
          await this.commandExecutor.executePrefixCommand(message);
          return;
        }
        if (message.content.startsWith('/')) {
          await this.commandExecutor.executeSlashCommand(message);
        }
      } catch (error) {
        logger.error('Error handling message:', error);
        try {
          await message.reply('An error occurred while processing your command.');
        } catch (replyError) {
          logger.error('Failed to send error reply:', replyError);
        }
      }
    });

    this.client.on('messageReactionAdd', async (reaction, user) => {
      try {
        if (reaction.partial) await reaction.fetch();
        await this.commandExecutor.executeReaction(reaction, user);
      } catch (error) {
        logger.error('Error handling reaction:', error);
      }
    });

    this.client.once('ready', () => {
      logger.success(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.on('error', (error) => logger.error('Discord client error:', error));
    this.client.on('disconnect', () => logger.warn('Discord client disconnected'));
  }

  async shutdown() {
    await this.commandRegistry.shutdown();
    await this.client.destroy();
    logger.info('Discord bot shutdown successfully');
  }

  getCommands() {
    return this.commandRegistry.getAll();
  }

  getCommand(name) {
    return this.commandRegistry.get(name);
  }

  async reloadCommands() {
    await this.commandRegistry.reload();
  }
}

module.exports = DiscordBot;
