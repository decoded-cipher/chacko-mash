import { Client, Message, MessageReaction, User, GuildMember } from 'discord.js';
import { Command, CommandRegistry } from '../types';
import logger from '../utils/logger';

export class CommandExecutor {
  private commandRegistry: CommandRegistry;
  private prefix: string;
  private cooldowns: Map<string, Map<string, number>> = new Map();

  constructor(commandRegistry: CommandRegistry, prefix: string = '$') {
    this.commandRegistry = commandRegistry;
    this.prefix = prefix;
  }

  async executePrefixCommand(message: Message): Promise<void> {
    try {
      // Check permissions
      if (!this.hasPermission(message.member)) {
        await message.reply(`You are not allowed to use this command. Please contact <@&${process.env.PRIORITY_ROLE_01}> for more details.`);
        return;
      }

      const [cmdName, targetChannel, ...args] = message.content
        .trim()
        .substring(this.prefix.length)
        .split(' | ');

      const cleanTargetChannel = targetChannel?.replace(/[^0-9\s]/g, '') || '';

      if (cmdName) {
        logger.command(cmdName, message.author.id);
      }

      // Look for the command in the registry
      if (!cmdName) {
        await message.reply('Invalid command format. Use `/help` to see available commands.');
        return;
      }
      
      const command = this.commandRegistry.get(cmdName);
      if (!command) {
        await message.reply('Invalid command format. Use `/help` to see available commands.');
        return;
      }

      // Execute the command with proper arguments
      await this.executeCommand(command, message, cleanTargetChannel || '', args.join(' '));

    } catch (error) {
      logger.errorWithContext('Error handling prefixed command', error);
      await message.reply('An error occurred while processing your command.');
    }
  }

  async executeSlashCommand(message: Message): Promise<void> {
    try {
      const commandName = message.content.split(' ')[0];
      if (!commandName) return;
      
      const command = this.commandRegistry.get(commandName);
      if (!command) {
        logger.warn(`Command not found: ${commandName}`);
        await message.reply(`Command \`${commandName}\` not found. Use \`/help\` to see available commands.`);
        return;
      }

      // Execute the command with proper arguments
      const args = message.content.split(' ').slice(1);
      await this.executeCommand(command, message, ...args);

    } catch (error) {
      logger.errorWithContext('Error executing slash command', error);
      await message.reply('An error occurred while processing your command.');
    }
  }

  async executeDirectMessage(message: Message): Promise<void> {
    try {
      if (message.content.startsWith('/edit-profile')) {
        const command = this.commandRegistry.get('/profile');
        if (command) {
          await this.executeCommand(command, message);
        }
      } else {
        // Forward DM to target channel
        const targetChannel = this.client.channels.cache.get(process.env.TARGET_CHANNEL || '');
        if (targetChannel && 'send' in targetChannel) {
          const embed = {
            color: 0x4b9fc3,
            author: {
              name: message.author.username,
              icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
            },
            description: message.content,
            footer: {
              text: new Date().toString(),
            },
          };
          await targetChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      logger.errorWithContext('Error handling direct message', error);
    }
  }

  async executeReaction(reaction: MessageReaction, user: User): Promise<void> {
    try {
      if (reaction.message.channel?.id === process.env.HF_CHANNEL && reaction.emoji.name === 'hacktoberfest') {
        const member = reaction.message.guild?.members.cache.get(user.id);
        const hasPermission = member?.roles.cache.some(
          (role: any) => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
        );

        if (!hasPermission) {
          await reaction.users.remove(user.id);
          await user.send(`You are not allowed to use this reaction in <#${process.env.HF_CHANNEL}> channel.`);
          return;
        }

        if (reaction.count === 1) {
          const command = this.commandRegistry.get('/hacktoberfest');
          if (command) {
            await this.executeCommand(command, this.client, reaction.message, reaction, user);
          }
        } else {
          await reaction.users.remove(user.id);
          await user.send('This message is already verified by an X-Men or the Server Moderator.');
        }
      }
    } catch (error) {
      logger.error('Error handling reaction:', error);
    }
  }

  private async executeCommand(command: Command, ...args: any[]): Promise<void> {
    try {
      // Check if command is enabled
      if (!command.metadata.enabled) {
        const replyMsg = args.find(arg => arg?.reply);
        if (replyMsg) {
          await replyMsg.reply('This command is currently disabled.');
        }
        return;
      }

      // Check cooldown
      const userMsg = args.find(arg => arg?.author?.id);
      if (userMsg) {
        const cooldownError = this.checkCooldown(command, userMsg.author.id);
        if (cooldownError) {
          await userMsg.reply(cooldownError);
          return;
        }
      }

      // Validate arguments if validator exists
      const commandArgs = args.filter(arg => typeof arg === 'string');
      if (command.validate) {
        const validationResult = command.validate(commandArgs);
        if (validationResult !== true) {
          const replyMsg = args.find(arg => arg?.reply);
          if (replyMsg) {
            await replyMsg.reply(typeof validationResult === 'string' ? validationResult : 'Invalid arguments provided.');
          }
          return;
        }
      }

      // Check guild/DM requirements
      const guildMsg = args.find(arg => arg?.guild !== undefined);
      if (guildMsg) {
        if (command.metadata.requiresGuild && !guildMsg.guild) {
          await guildMsg.reply('This command can only be used in a server.');
          return;
        }

        if (command.metadata.requiresDM && guildMsg.guild) {
          await guildMsg.reply('This command can only be used in DMs.');
          return;
        }
      }

      // Execute the command
      await command.execute(this.client, ...args);

    } catch (error) {
      logger.errorWithContext(`Failed to execute command ${command.metadata.name}`, error);
      const errorMsg = args.find(arg => arg?.reply);
      if (errorMsg) {
        await errorMsg.reply('An error occurred while processing your command.');
      }
    }
  }

  private hasPermission(member: GuildMember | null): boolean {
    if (!member) return false;
    return member.roles.cache.some(
      role => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
    );
  }

  private checkCooldown(command: Command, userId: string): string | null {
    if (!command.metadata.cooldown) return null;

    const now = Date.now();
    const cooldownAmount = command.metadata.cooldown * 1000;

    if (!this.cooldowns.has(command.metadata.name)) {
      this.cooldowns.set(command.metadata.name, new Map());
    }

    const timestamps = this.cooldowns.get(command.metadata.name)!;
    const lastUsage = timestamps.get(userId);

    if (lastUsage && (now - lastUsage) < cooldownAmount) {
      const timeLeft = Math.ceil((cooldownAmount - (now - lastUsage)) / 1000);
      return `Please wait ${timeLeft} more second(s) before using this command again.`;
    }

    timestamps.set(userId, now);
    return null;
  }

  get client(): Client {
    // This should be injected from the DiscordBot class
    return (global as any).discordClient;
  }
} 