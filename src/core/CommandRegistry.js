const { readdir } = require('fs/promises');
const { watch } = require('fs');
const path = require('path');

class CommandRegistry {
  constructor(commandsPath) {
    this.commands = new Map();
    this.commandsPath = commandsPath;
    this.isWatching = false;
  }

  async initialize() {
    try {
      await this.loadAllCommands();
      await this.setupHotReload();
      console.log(`Commands loaded: ${this.commands.size}`);
    } catch (error) {
      console.error('Failed to initialize command registry:', error);
      throw error;
    }
  }

  register(command) {
    try {
      if (!this.validateCommand(command)) return;
      this.commands.set(command.metadata.name, command);
      if (command.onLoad) {
        command.onLoad().catch((err) => console.error(`Failed to load command ${command.metadata.name}:`, err));
      }
    } catch (error) {
      console.error(`Failed to register command ${command.metadata.name}:`, error);
    }
  }

  unregister(name) {
    const command = this.commands.get(name);
    if (!command) return;
    try {
      if (command.onUnload) {
        command.onUnload().catch((err) => console.error(`Failed to unload command ${name}:`, err));
      }
      this.commands.delete(name);
    } catch (error) {
      console.error(`Failed to unregister command ${name}:`, error);
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
      this.commands.clear();
      await this.loadAllCommands();
    } catch (error) {
      console.error('Failed to reload commands:', error);
      throw error;
    }
  }

  validateCommand(command) {
    const requiredFields = ['name', 'description'];
    for (const field of requiredFields) {
      if (!command.metadata[field]) return false;
    }
    if (!command.execute || typeof command.execute !== 'function') return false;
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
      if (command && command.metadata) this.register(command);
    } catch (err) {
      console.error(`Failed to import command file ${filename}:`, err);
    }
  }

  async setupHotReload() {
    if (this.isWatching) return;
    try {
      watch(this.commandsPath, { recursive: true }, async (_eventType, filename) => {
        if (!filename || !filename.endsWith('.js') || filename.startsWith('_')) return;
        setTimeout(async () => {
          try {
            await this.reload();
          } catch (err) {
            console.error('Failed to reload commands after file change:', err);
          }
        }, 1000);
      });
      this.isWatching = true;
    } catch (err) {
      // Recursive watch unavailable on some platforms (e.g. production Linux)
      this.isWatching = false;
    }
  }

  async shutdown() {
    this.isWatching = false;
    for (const command of this.commands.values()) {
      if (command.onUnload) {
        await command.onUnload().catch((err) => console.error(`Failed to unload command ${command.metadata.name}:`, err));
      }
    }
    this.commands.clear();
  }
}

module.exports = CommandRegistry;
