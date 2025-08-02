import { Client, Message } from 'discord.js';
import logger from '../utils/logger';

export default {
  metadata: {
    name: '/ping',
    description: 'Check bot latency and response time',
    category: 'Utility',
    usage: '/ping',
    examples: ['/ping'],
    permissions: [],
    cooldown: 3,
    enabled: true,
    aliases: ['/latency', '/p'],
    requiresGuild: false,
    requiresDM: false,
  },
  
  async execute(client: Client, message: Message): Promise<void> {
    try {
      const sent = await message.reply('Pinging...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      
      await sent.edit(`🏓 Pong! Latency is ${latency}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
      
      logger.info('Ping command executed', {
        userId: message.author.id,
        username: message.author.username,
        latency: latency,
        apiLatency: client.ws.ping
      });
      
    } catch (error) {
      logger.errorWithContext('Failed to execute ping command', error);
      await message.reply('An error occurred while checking latency.');
    }
  },
  
  validate(_args: any[]): boolean | string {
    // Ping command doesn't require any arguments
    return true;
  },
}; 