import { Client, Message, MessageReaction, User } from 'discord.js';
import path from 'path';
import { CommandRegistry } from './CommandRegistry';
import { CommandExecutor } from './CommandExecutor';
import logger from '../utils/logger';

class DiscordBot {
  public client: Client;
  private commandRegistry: CommandRegistry;
  private commandExecutor: CommandExecutor;
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

    // Initialize command registry
    const commandsPath = path.join(__dirname, '../commands');
    this.commandRegistry = new CommandRegistry(commandsPath);
    this.commandExecutor = new CommandExecutor(this.commandRegistry, this.prefix);

    // Make client globally available for command executor
    (global as any).discordClient = this.client;
  }

  async initialize(): Promise<void> {
    try {
      logger.section('Discord Bot Initialization');
      
      // Initialize command registry
      await this.commandRegistry.initialize();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Login to Discord
      await this.client.login(process.env.DISCORDJS_BOT_TOKEN);
      
      logger.success('Discord bot initialized successfully');
    } catch (error) {
      logger.errorWithContext('Failed to initialize Discord bot', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Message event handler
    this.client.on('messageCreate', async (message: Message) => {
      try {
        // Ignore bot messages
        if (message.author.bot) return;

        // Handle DM messages
        if (!message.guild) {
          await this.commandExecutor.executeDirectMessage(message);
          return;
        }

        // Handle guild messages with prefix
        if (message.content.startsWith(this.prefix)) {
          await this.commandExecutor.executePrefixCommand(message);
          return;
        }

        // Handle slash commands
        if (message.content.startsWith('/')) {
          await this.commandExecutor.executeSlashCommand(message);
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
    });

    // Reaction event handler
    this.client.on('messageReactionAdd', async (reaction, user) => {
      try {
        if (reaction.partial) {
          await reaction.fetch();
        }
        await this.commandExecutor.executeReaction(reaction as MessageReaction, user as User);
      } catch (error) {
        logger.error('Error handling reaction:', error);
      }
    });

    // Ready event handler
    this.client.once('ready', () => {
      logger.success(`Logged in as ${this.client.user?.tag}`);
    });

    // Error event handler
    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
    });

    // Disconnect event handler
    this.client.on('disconnect', () => {
      logger.warn('Discord client disconnected');
    });
  }

  async shutdown(): Promise<void> {
    try {
      // Shutdown command registry
      await this.commandRegistry.shutdown();
      
      // Destroy Discord client
      await this.client.destroy();
      
      logger.info('Discord bot shutdown successfully');
    } catch (error) {
      logger.error('Error during Discord bot shutdown:', error);
    }
  }

  // Public methods for external access
  getCommands() {
    return this.commandRegistry.getAll();
  }

  getCommand(name: string) {
    return this.commandRegistry.get(name);
  }

  async reloadCommands() {
    await this.commandRegistry.reload();
  }
}

export default DiscordBot; 