const express = require('express');
const logger = require('../utils/logger');

class HealthServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'OK',
        message: 'Discord bot is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    this.app.get('/', (_req, res) => {
      res.json({
        message: 'Chacko Mash Discord Bot',
        status: 'Running',
        endpoints: { health: '/health' },
      });
    });

    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'Endpoint not found',
        path: req.originalUrl,
      });
    });

    this.app.use((error, _req, res) => {
      logger.errorWithContext('Health server error', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
    });
  }

  start() {
    const port = process.env.PORT || 3000;
    this.server = this.app.listen(port, () => {
      logger.success(`Health check server running on port ${port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close(() => logger.success('Health server stopped'));
    }
  }
}

module.exports = HealthServer;
