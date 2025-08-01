import { Client } from 'discord.js';

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

export interface Command {
  name: string;
  description: string;
  execute: (client: Client, ...args: any[]) => Promise<void> | void;
  permissions?: string[];
  cooldown?: number;
}

export interface Event {
  name: string;
  once?: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void> | void;
}

export interface Service {
  name: string;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}

export interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BirthdayWish {
  age: number;
  ageWish: string;
  template: string;
}

export interface ImageGenerationData {
  name: string;
  certificateId: string;
  avatar?: string;
  template?: string;
} 