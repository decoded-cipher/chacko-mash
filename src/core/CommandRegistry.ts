import { readdir } from 'fs/promises';
import { watch as fsWatch } from 'fs';
import path from 'path';
import { Command, CommandRegistry as ICommandRegistry } from '../types';
import logger from '../utils/logger';

export class CommandRegistry implements ICommandRegistry {
  public commands: Map<string, Command> = new Map();
  private commandsPath: string;
  private isWatching: boolean = false;

  constructor(commandsPath: string) {
    this.commandsPath = commandsPath;
  }

  async initialize(): Promise<void> {
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

  register(command: Command): void {
    try {
      // Validate command structure
      if (!this.validateCommand(command)) {
        logger.warn(`Skipping invalid command: ${command.metadata.name}`);
        return;
      }

      // Register main command
      this.commands.set(command.metadata.name, command);

      // Register aliases
      if (command.metadata.aliases) {
        for (const alias of command.metadata.aliases) {
          this.commands.set(alias, command);
        }
      }

      // Call onLoad if available
      if (command.onLoad) {
        command.onLoad().catch(error => {
          logger.error(`Failed to load command ${command.metadata.name}:`, error);
        });
      }

      logger.info(`Registered command: ${command.metadata.name}`);
    } catch (error) {
      logger.errorWithContext(`Failed to register command ${command.metadata.name}`, error);
    }
  }

  unregister(name: string): void {
    const command = this.commands.get(name);
    if (!command) return;

    try {
      // Call onUnload if available
      if (command.onUnload) {
        command.onUnload().catch(error => {
          logger.error(`Failed to unload command ${name}:`, error);
        });
      }

      // Remove from commands map
      this.commands.delete(name);

      // Remove aliases
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

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }



  async reload(): Promise<void> {
    try {
      logger.info('Reloading all commands...');
      
      // Clear existing commands
      this.commands.clear();

      // Reload all commands
      await this.loadAllCommands();
      
      logger.success(`Reloaded ${this.commands.size} commands`);
    } catch (error) {
      logger.errorWithContext('Failed to reload commands', error);
      throw error;
    }
  }

  private validateCommand(command: Command): boolean {
    const requiredFields = ['name', 'description', 'usage', 'examples'];
    
    for (const field of requiredFields) {
      if (!command.metadata[field as keyof typeof command.metadata]) {
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

  private async loadAllCommands(): Promise<void> {
    try {
      const commandFiles = await readdir(this.commandsPath);

      for (const file of commandFiles) {
        // Skip non-command files
        if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
        if (file.startsWith('.') || file.includes('.d.ts')) continue;

        await this.loadCommandFromFile(file);
      }
    } catch (error) {
      logger.errorWithContext('Failed to load commands', error);
      throw error;
    }
  }

  private async loadCommandFromFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.commandsPath, filename);
      const commandModule = await import(filePath);
      
      if (commandModule.default && commandModule.default.metadata) {
        this.register(commandModule.default);
      } else {
        logger.warn(`Skipping invalid command file: ${filename}`);
      }
    } catch (importError) {
      logger.error(`Failed to import command file ${filename}:`, importError);
    }
  }

  private async setupHotReload(): Promise<void> {
    if (this.isWatching) return;

    try {
      this.isWatching = true;
      
      // Watch the commands directory for changes
      fsWatch(this.commandsPath, { recursive: true }, async (_eventType, filename) => {
        if (!filename) return;
        
        // Skip non-command files
        if (!filename.endsWith('.ts') && !filename.endsWith('.js')) return;
        if (filename.startsWith('.') || filename.includes('.d.ts')) return;

        logger.info(`Command file changed: ${filename}`);
        
        // Debounce reload to avoid multiple reloads
        setTimeout(async () => {
          try {
            await this.reload();
          } catch (error) {
            logger.error('Failed to reload commands after file change:', error);
          }
        }, 1000);
      });

      logger.info('Hot reload enabled for commands');
    } catch (error) {
      logger.error('Failed to setup hot reload:', error);
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.isWatching = false;
      
      // Call onUnload for all commands
      for (const command of this.commands.values()) {
        if (command.onUnload) {
          await command.onUnload().catch(error => {
            logger.error(`Failed to unload command ${command.metadata.name}:`, error);
          });
        }
      }

      this.commands.clear();
      
      logger.info('Command registry shutdown successfully');
    } catch (error) {
      logger.error('Error during command registry shutdown:', error);
    }
  }
} 