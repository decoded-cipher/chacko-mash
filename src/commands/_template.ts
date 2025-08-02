import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

/**
 * Command Template
 * 
 * This is a template for creating new commands in the plug-and-play architecture.
 * Copy this file and rename it to your command name, then customize it.
 * 
 * Features included:
 * - Metadata with all required fields
 * - Proper validation
 * - Error handling
 * - Logging
 * - Optional lifecycle hooks (onLoad, onUnload)
 */

export default {
  metadata: {
    name: '/template', // Change this to your command name
    description: 'Template command description', // Describe what your command does
    category: 'Utility', // Choose: Utility, Admin, Fun, System, Special, User
    usage: '/template [args]', // Show how to use the command
    examples: ['/template', '/template arg1', '/template arg1 arg2'], // Provide usage examples
    permissions: [], // Add required permissions if any
    cooldown: 5, // Cooldown in seconds (0 for no cooldown)
    enabled: true, // Set to false to disable the command
    aliases: ['/t', '/temp'], // Alternative command names
    requiresGuild: false, // Set to true if command only works in servers
    requiresDM: false, // Set to true if command only works in DMs
  },

  /**
   * Main command execution function
   * @param client Discord client instance
   * @param message The message that triggered the command
   * @param args Command arguments (already parsed)
   */
  async execute(_client: Client, message: Message, ...args: any[]): Promise<void> {
    try {
      // Your command logic goes here
      logger.info('Template command executed', {
        userId: message.author.id,
        username: message.author.username,
        args: args
      });

      // Example: Send a response
      await message.reply('Template command executed successfully!');

    } catch (error) {
      logger.errorWithContext('Failed to execute template command', error);
      await message.reply('An error occurred while processing your command.');
    }
  },

  /**
   * Validate command arguments
   * @param args Command arguments to validate
   * @returns true if valid, error message string if invalid
   */
  validate(_args: any[]): boolean | string {
    // Add your validation logic here
    // Example: Check if required arguments are provided
    // if (args.length < 1) {
    //   return 'This command requires at least one argument';
    // }
    
    return true; // Return true if validation passes
  },

  /**
   * Optional: Called when the command is loaded
   * Useful for initialization, setting up timers, etc.
   */
  onLoad(): Promise<void> {
    logger.info('Template command loaded');
    return Promise.resolve();
  },

  /**
   * Optional: Called when the command is unloaded
   * Useful for cleanup, stopping timers, etc.
   */
  onUnload(): Promise<void> {
    logger.info('Template command unloaded');
    return Promise.resolve();
  },
}; 