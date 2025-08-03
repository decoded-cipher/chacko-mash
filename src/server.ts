import dotenv from 'dotenv';
dotenv.config();

import DiscordBot from './core/DiscordBot';
import HealthServer from './services/healthServer';
import logger from './utils/logger';

class Application {
  private bot: DiscordBot;
  private healthServer: HealthServer;

  constructor() {
    this.bot = new DiscordBot();
    this.healthServer = new HealthServer();
  }

  async start(): Promise<void> {
    try {
      logger.section('Application Startup');

      // Start health server
      this.healthServer.start();

      // Initialize Discord bot
      await this.bot.initialize();

      // Set up event handlers
      this.setupEventHandlers();

      // Graceful shutdown handling
      this.setupGracefulShutdown();

      logger.success('Application started successfully');
    } catch (error) {
      logger.errorWithContext('Failed to start application', error);
      process.exit(1);
    }
  }

  private setupEventHandlers(): void {
    // Bot ready event
    this.bot.client.on('ready', async () => {
      const command = this.bot.getCommand('/onReady');
      if (command) {
        await command.execute(this.bot.client);
      }
      
      // Start birthday notification cron job
      const bdayNotifyCommand = this.bot.getCommand('/bdayNotify');
      if (bdayNotifyCommand) {
        await bdayNotifyCommand.execute(this.bot.client);
      }
    });

    // Guild member add
    this.bot.client.on('guildMemberAdd', async (member) => {
      const command = this.bot.getCommand('/welcome');
      if (command) {
        await command.execute(this.bot.client, member);
      }
    });

    // Error handling
    this.bot.client.on('error', (error) => {
      logger.errorWithContext('Discord client error', error);
    });

    this.bot.client.on('warn', (warning) => {
      logger.warn('Discord client warning:', warning);
    });
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.section('Graceful Shutdown');
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      try {
        // Stop health server
        this.healthServer.stop();

        // Shutdown Discord bot
        await this.bot.shutdown();

        logger.success('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.errorWithContext('Error during shutdown', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection:', { reason, promise });
      shutdown('unhandledRejection');
    });
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
}); 