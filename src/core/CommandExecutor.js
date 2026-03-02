const logger = require('../utils/logger');

class CommandExecutor {
  constructor(commandRegistry, prefix = '$') {
    this.commandRegistry = commandRegistry;
    this.prefix = prefix;
    this.cooldowns = new Map();
  }

  async executePrefixCommand(message) {
    try {
      if (!this.hasPermission(message.member)) {
        await message.reply(`You are not allowed to use this command. Please contact <@&${process.env.PRIORITY_ROLE_01}> for more details.`);
        return;
      }

      const [cmdName, targetChannel, ...args] = message.content
        .trim()
        .substring(this.prefix.length)
        .split(' | ');
      const cleanTargetChannel = targetChannel?.replace(/[^0-9\s]/g, '') || '';

      if (cmdName) logger.command(cmdName, message.author.id);
      if (!cmdName) {
        await message.reply('Invalid command format. Use `/help` to see available commands.');
        return;
      }

      const command = this.commandRegistry.get(cmdName);
      if (!command) {
        await message.reply('Invalid command format. Use `/help` to see available commands.');
        return;
      }

      await this.executeCommand(command, message, cleanTargetChannel || '', args.join(' '));
    } catch (error) {
      logger.errorWithContext('Error handling prefixed command', error);
      await message.reply('An error occurred while processing your command.');
    }
  }

  async executeSlashCommand(message) {
    try {
      const commandName = message.content.split(' ')[0];
      if (!commandName) return;

      const command = this.commandRegistry.get(commandName);
      if (!command) {
        logger.warn(`Command not found: ${commandName}`);
        await message.reply(`Command \`${commandName}\` not found. Use \`/help\` to see available commands.`);
        return;
      }
      const args = message.content.split(' ').slice(1);
      await this.executeCommand(command, message, ...args);
    } catch (error) {
      logger.errorWithContext('Error executing slash command', error);
      await message.reply('An error occurred while processing your command.');
    }
  }

  async executeDirectMessage(message) {
    try {
      if (message.content.startsWith('/edit-profile')) {
        const command = this.commandRegistry.get('/profile');
        if (command) await this.executeCommand(command, message);
      } else {
        const targetChannel = this.client.channels.cache.get(process.env.TARGET_CHANNEL || '');
        if (targetChannel && 'send' in targetChannel) {
          const embed = {
            color: 0x4b9fc3,
            author: {
              name: message.author.username,
              icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,
            },
            description: message.content,
            footer: { text: new Date().toString() },
          };
          await targetChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      logger.errorWithContext('Error handling direct message', error);
    }
  }

  async executeReaction(reaction, user) {
    try {
      if (reaction.message.channel?.id === process.env.HF_CHANNEL && reaction.emoji.name === 'hacktoberfest') {
        const member = reaction.message.guild?.members.cache.get(user.id);
        const hasPermission = member?.roles.cache.some(
          (role) => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
        );
        if (!hasPermission) {
          await reaction.users.remove(user.id);
          await user.send(`You are not allowed to use this reaction in <#${process.env.HF_CHANNEL}> channel.`);
          return;
        }
        if (reaction.count === 1) {
          const command = this.commandRegistry.get('/hacktoberfest');
          if (command) await this.executeCommand(command, this.client, reaction.message, reaction, user);
        } else {
          await reaction.users.remove(user.id);
          await user.send('This message is already verified by an X-Men or the Server Moderator.');
        }
      }
    } catch (error) {
      logger.error('Error handling reaction:', error);
    }
  }

  async executeCommand(command, ...args) {
    try {
      if (command.metadata.enabled === false) {
        const replyMsg = args.find((arg) => arg?.reply);
        if (replyMsg) await replyMsg.reply('This command is currently disabled.');
        return;
      }

      const userMsg = args.find((arg) => arg?.author?.id);
      if (userMsg) {
        const cooldownError = this.checkCooldown(command, userMsg.author.id);
        if (cooldownError) {
          await userMsg.reply(cooldownError);
          return;
        }
      }

      const commandArgs = args.filter((arg) => typeof arg === 'string');
      if (command.validate) {
        const validationResult = command.validate(commandArgs);
        if (validationResult !== true) {
          const replyMsg = args.find((arg) => arg?.reply);
          if (replyMsg) {
            await replyMsg.reply(typeof validationResult === 'string' ? validationResult : 'Invalid arguments provided.');
          }
          return;
        }
      }

      const guildMsg = args.find((arg) => arg?.guild !== undefined);
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

      await command.execute(this.client, ...args);
    } catch (error) {
      logger.errorWithContext(`Failed to execute command ${command.metadata.name}`, error);
      const errorMsg = args.find((arg) => arg?.reply);
      if (errorMsg) await errorMsg.reply('An error occurred while processing your command.');
    }
  }

  hasPermission(member) {
    if (!member) return false;
    return member.roles.cache.some(
      (role) => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02
    );
  }

  checkCooldown(command, userId) {
    if (!command.metadata.cooldown) return null;
    const now = Date.now();
    const cooldownAmount = command.metadata.cooldown * 1000;
    if (!this.cooldowns.has(command.metadata.name)) {
      this.cooldowns.set(command.metadata.name, new Map());
    }
    const timestamps = this.cooldowns.get(command.metadata.name);
    const lastUsage = timestamps.get(userId);
    if (lastUsage && now - lastUsage < cooldownAmount) {
      const timeLeft = Math.ceil((cooldownAmount - (now - lastUsage)) / 1000);
      return `Please wait ${timeLeft} more second(s) before using this command again.`;
    }
    timestamps.set(userId, now);
    return null;
  }

  get client() {
    return global.discordClient;
  }
}

module.exports = CommandExecutor;
