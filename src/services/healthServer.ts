import express from 'express';

class HealthServer {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'OK',
        message: 'Discord bot is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    this.app.get('/', (_req, res) => {
      res.json({
        message: 'Chacko Mash Discord Bot',
        status: 'Running',
        endpoints: {
          health: '/health'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'Endpoint not found',
        path: req.originalUrl
      });
    });

    // Error handler
    this.app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Health server error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
      });
    });
  }

  start(): void {
    const port = process.env.PORT || 3000;
    this.server = this.app.listen(port, () => {
      console.log(`Health check server running on port ${port}`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close(() => {
        console.log('Health server stopped');
      });
    }
  }
}

export default HealthServer; 