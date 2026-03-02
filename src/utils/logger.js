const winston = require('winston');
const path = require('path');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const colors = { error: 'red', warn: 'yellow', info: 'green', debug: 'white' };
winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()}: ${message}`)
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()}: ${message}`)
);

const transports = [new winston.transports.Console({ format: consoleFormat })];

if (process.env.ENABLE_LOGS === 'true') {
  transports.push(
    new winston.transports.File({ filename: path.join(process.cwd(), 'logs', 'combined.log'), format: fileFormat }),
    new winston.transports.File({ filename: path.join(process.cwd(), 'logs', 'error.log'), level: 'error', format: fileFormat })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports,
});

logger.success = (message) => {
  logger.info(`✓ ${message}`);
  logger.info('');
};

logger.section = (title) => {
  logger.info(`=== ${title} ===`);
  logger.info('');
};

logger.command = (command, userId) => {
  logger.info(`Command: ${command}${userId ? ` by ${userId}` : ''}`);
  logger.info('');
};

logger.errorWithContext = (message, error) => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`);
  } else {
    logger.error(message);
  }
  logger.info('');
};

module.exports = logger;
