require('dotenv').config();

const DiscordBot = require('./src/core/DiscordBot');

class Application {
  constructor() {
    this.bot = new DiscordBot();
  }

  startHeartbeat() {
    if(!process.env.HEARTBEAT_URL || !process.env.HEARTBEAT_INTERVAL) {
      console.warn('HEARTBEAT_URL or HEARTBEAT_INTERVAL not set, skipping uptime heartbeat');
      return;
    }

    const ping = async () => {
      try {
        await fetch(process.env.HEARTBEAT_URL, { method: 'HEAD' });
      } catch (e) {
        console.error('[heartbeat]', e.message);
      }
      setTimeout(ping, Number(process.env.HEARTBEAT_INTERVAL) * 60 * 1000).unref();
    };
    ping();
  }

  async start() {
    try {
      await this.bot.initialize();
      global.discordBot = this.bot;
      this.setupEventHandlers();
      this.setupGracefulShutdown();
      console.log('\n--- Application started successfully');
    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  setupEventHandlers() {
    this.bot.client.on('ready', async () => {
      this.startHeartbeat();

      const command = this.bot.getCommand('/onReady');
      if (command) await command.execute(this.bot.client);

      const bdayNotifyCommand = this.bot.getCommand('/bdayNotify');
      if (bdayNotifyCommand) await bdayNotifyCommand.execute(this.bot.client);
    });

    this.bot.client.on('guildMemberAdd', async (member) => {
      const command = this.bot.getCommand('/welcome');
      if (command) await command.execute(this.bot.client, member);
    });

    this.bot.client.on('error', (error) => console.error('Discord client error:', error));
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      try {
        await this.bot.shutdown();
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
      console.error('Unhandled rejection:', reason);
      shutdown('unhandledRejection');
    });
  }
}

const app = new Application();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
