const { readdir } = require('fs/promises');
const { watch } = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class CommandRegistry {
  constructor(commandsPath) {
    this.commands = new Map();
    this.commandsPath = commandsPath;
    this.isWatching = false;
  }

  async initialize() {
    try {
      logger.section('Command Registry Initialization');
      await this.loadAllCommands();
      await this.setupHotReload();
      logger.success(`Command registry initialized with ${this.commands.size} commands`);
    } catch (error) {
      logger.errorWithContext('Failed to initialize command registry', error);
      throw error;
    }
  }

  register(command) {
    try {
      if (!this.validateCommand(command)) {
        logger.warn(`Skipping invalid command: ${command.metadata.name}`);
        return;
      }
      this.commands.set(command.metadata.name, command);
      if (command.metadata.aliases) {
        for (const alias of command.metadata.aliases) {
          this.commands.set(alias, command);
        }
      }
      if (command.onLoad) {
        command.onLoad().catch((err) => logger.error(`Failed to load command ${command.metadata.name}:`, err));
      }
      logger.info(`Registered command: ${command.metadata.name}`);
    } catch (error) {
      logger.errorWithContext(`Failed to register command ${command.metadata.name}`, error);
    }
  }

  unregister(name) {
    const command = this.commands.get(name);
    if (!command) return;
    try {
      if (command.onUnload) {
        command.onUnload().catch((err) => logger.error(`Failed to unload command ${name}:`, err));
      }
      this.commands.delete(name);
      if (command.metadata.aliases) {
        for (const alias of command.metadata.aliases) {
          this.commands.delete(alias);
        }
      }
      logger.info(`Unregistered command: ${name}`);
    } catch (error) {
      logger.errorWithContext(`Failed to unregister command ${name}`, error);
    }
  }

  get(name) {
    return this.commands.get(name);
  }

  getAll() {
    return Array.from(this.commands.values());
  }

  async reload() {
    try {
      logger.info('Reloading all commands...');
      this.commands.clear();
      await this.loadAllCommands();
      logger.success(`Reloaded ${this.commands.size} commands`);
    } catch (error) {
      logger.errorWithContext('Failed to reload commands', error);
      throw error;
    }
  }

  validateCommand(command) {
    const requiredFields = ['name', 'description', 'usage', 'examples'];
    for (const field of requiredFields) {
      if (!command.metadata[field]) {
        logger.warn(`Command ${command.metadata.name} missing required field: ${field}`);
        return false;
      }
    }
    if (!command.execute || typeof command.execute !== 'function') {
      logger.warn(`Command ${command.metadata.name} missing execute function`);
      return false;
    }
    return true;
  }

  async loadAllCommands() {
    const commandFiles = await readdir(this.commandsPath);
    for (const file of commandFiles) {
      if (!file.endsWith('.js')) continue;
      if (file.startsWith('_') || file.startsWith('.')) continue;
      await this.loadCommandFromFile(file);
    }
  }

  async loadCommandFromFile(filename) {
    try {
      const filePath = path.join(this.commandsPath, filename);
      delete require.cache[require.resolve(filePath)];
      const commandModule = require(filePath);
      const command = commandModule.default || commandModule;
      if (command && command.metadata) {
        this.register(command);
      } else {
        logger.warn(`Skipping invalid command file: ${filename}`);
      }
    } catch (err) {
      logger.error(`Failed to import command file ${filename}:`, err);
    }
  }

  async setupHotReload() {
    if (this.isWatching) return;
    this.isWatching = true;
    watch(this.commandsPath, { recursive: true }, async (_eventType, filename) => {
      if (!filename || !filename.endsWith('.js') || filename.startsWith('_')) return;
      logger.info(`Command file changed: ${filename}`);
      setTimeout(async () => {
        try {
          await this.reload();
        } catch (err) {
          logger.error('Failed to reload commands after file change:', err);
        }
      }, 1000);
    });
    logger.info('Hot reload enabled for commands');
  }

  async shutdown() {
    this.isWatching = false;
    for (const command of this.commands.values()) {
      if (command.onUnload) {
        await command.onUnload().catch((err) => logger.error(`Failed to unload command ${command.metadata.name}:`, err));
      }
    }
    this.commands.clear();
    logger.info('Command registry shutdown successfully');
  }
}

module.exports = CommandRegistry;
