import dotenv from 'dotenv';
import DiscordBot from './core/DiscordBot';
import HealthServer from './services/healthServer';

// Load environment variables
dotenv.config();

class Application {
  private bot: DiscordBot;
  private healthServer: HealthServer;

  constructor() {
    this.bot = new DiscordBot();
    this.healthServer = new HealthServer();
  }

  async start(): Promise<void> {
    try {
      console.log('Starting Chacko Mash Discord Bot...');

      // Start health server
      this.healthServer.start();

      // Initialize Discord bot
      await this.bot.initialize();

      // Set up event handlers
      this.setupEventHandlers();

      // Graceful shutdown handling
      this.setupGracefulShutdown();

      console.log('Application started successfully');
    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private setupEventHandlers(): void {
    // Bot ready event
    this.bot.client.on('ready', async () => {
      const command = this.bot.commands.get('/onReady');
      if (command) {
        await command.execute(this.bot.client);
      }
      
      // Start birthday notification cron job
      const bdayNotifyCommand = this.bot.commands.get('/bdayNotify');
      if (bdayNotifyCommand) {
        await bdayNotifyCommand.execute(this.bot.client);
      }
    });

    // Message handling
    this.bot.client.on('messageCreate', async (message) => {
      await this.bot.handleMessage(message);
    });

    // Reaction handling
    this.bot.client.on('messageReactionAdd', async (reaction, user) => {
      await reaction.fetch();
      await this.bot.handleReaction(reaction as any, user as any);
    });

    // Guild member add
    this.bot.client.on('guildMemberAdd', async (member) => {
      const command = this.bot.commands.get('/welcome');
      if (command) {
        await command.execute(this.bot.client, member);
      }
    });

    // Error handling
    this.bot.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });

    this.bot.client.on('warn', (warning) => {
      console.warn('Discord client warning:', warning);
    });
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);

      try {
        // Stop health server
        this.healthServer.stop();

        // Shutdown Discord bot
        await this.bot.shutdown();

        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection:', { reason, promise });
      shutdown('unhandledRejection');
    });
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 