import { Client, Message } from 'discord.js';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  gender: 'Male' | 'Female';
  dob: {
    year: number;
    month: number;
    day: number;
  };
  discord: {
    tag: string;
    avatar: string;
  };
}

export interface HacktoberfestData {
  id: string;
  certificateId: string;
  name?: string;
  email?: string;
}

export interface CommandMetadata {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  permissions?: string[];
  cooldown?: number;
  enabled: boolean;
  aliases?: string[];
  requiresGuild?: boolean;
  requiresDM?: boolean;
}

export interface Command {
  metadata: CommandMetadata;
  execute: (client: Client, ...args: any[]) => Promise<void> | void;
  validate?: (args: any[]) => boolean | string;
  onLoad?: () => Promise<void>;
  onUnload?: () => Promise<void>;
}

export interface CommandRegistry {
  commands: Map<string, Command>;
  register: (command: Command) => void;
  unregister: (name: string) => void;
  get: (name: string) => Command | undefined;
  getAll: () => Command[];
  reload: () => Promise<void>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImageGenerationData {
  name: string;
  certificateId: string;
  avatar?: string;
  template?: string;
} 