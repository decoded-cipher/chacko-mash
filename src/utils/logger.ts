import winston from 'winston';
import path from 'path';

// Extend the Logger type to include our custom methods
interface CustomLogger extends winston.Logger {
  success(message: string): void;
  section(title: string): void;
  command(command: string, userId?: string): void;
  errorWithContext(message: string, error?: any): void;
}

// Simple log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Colors for console only
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white',
};

winston.addColors(colors);

// Console format with colors (Django style)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => 
    `${timestamp} ${level.toUpperCase()}: ${message}`
  )
);

// File format without colors (clean)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => 
    `${timestamp} ${level.toUpperCase()}: ${message}`
  )
);

// Create transports array
const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat })
];

// Add file transports only if ENABLE_LOGS is true
if (process.env.ENABLE_LOGS === 'true') {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: fileFormat
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat
    })
  );
}

// Create logger
const baseLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports
});

// Cast to custom logger type and add methods
const logger = baseLogger as CustomLogger;

logger.success = (message: string) => {
  logger.info(`✓ ${message}`);
  logger.info(''); // Empty line for spacing
};

logger.section = (title: string) => {
  logger.info(`=== ${title} ===`);
  logger.info(''); // Empty line for spacing
};

logger.command = (command: string, userId?: string) => {
  logger.info(`Command: ${command}${userId ? ` by ${userId}` : ''}`);
  logger.info(''); // Empty line for spacing
};

logger.errorWithContext = (message: string, error?: any) => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`);
  } else {
    logger.error(message);
  }
  logger.info(''); // Empty line for spacing
};

export default logger; 