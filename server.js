require('dotenv').config();

const DiscordBot = require('./src/core/DiscordBot');
const logger = require('./src/utils/logger');

class Application {
  constructor() {
    this.bot = new DiscordBot();
  }

  async start() {
    try {
      logger.section('Application Startup');
      await this.bot.initialize();
      global.discordBot = this.bot;
      this.setupEventHandlers();
      this.setupGracefulShutdown();
      logger.success('Application started successfully');
    } catch (error) {
      logger.errorWithContext('Failed to start application', error);
      process.exit(1);
    }
  }

  setupEventHandlers() {
    this.bot.client.on('ready', async () => {
      const command = this.bot.getCommand('/onReady');
      if (command) await command.execute(this.bot.client);

      const bdayNotifyCommand = this.bot.getCommand('/bdayNotify');
      if (bdayNotifyCommand) await bdayNotifyCommand.execute(this.bot.client);
    });

    this.bot.client.on('guildMemberAdd', async (member) => {
      const command = this.bot.getCommand('/welcome');
      if (command) await command.execute(this.bot.client, member);
    });

    this.bot.client.on('error', (error) => logger.errorWithContext('Discord client error', error));
    this.bot.client.on('warn', (warning) => logger.warn('Discord client warning:', warning));
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.section('Graceful Shutdown');
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      try {
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

const app = new Application();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
