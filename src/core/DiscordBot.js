const { Client, GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');
const CommandRegistry = require('./CommandRegistry');
const CommandExecutor = require('./CommandExecutor');

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
      await this.commandRegistry.initialize();
      this.setupEventHandlers();
      await this.client.login(process.env.DISCORDJS_BOT_TOKEN);
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    this.client.on('messageCreate', async (message) => {
      try {
        if (message.author.bot) return;
        if (!message.guild) {
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
        console.error('Error handling message:', error);
        try {
          await message.reply('An error occurred while processing your command.');
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError);
        }
      }
    });

    this.client.on('messageReactionAdd', async (reaction, user) => {
      try {
        if (reaction.partial) await reaction.fetch();
        await this.commandExecutor.executeReaction(reaction, user);
      } catch (error) {
        console.error('Error handling reaction:', error);
      }
    });

    this.client.on('error', (error) => console.error('Discord client error:', error));
  }

  async shutdown() {
    await this.commandRegistry.shutdown();
    await this.client.destroy();
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
