const http = require('http');

function startHealthServer(port = 3000) {
    const server = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        if (req.url === '/health' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'OK',
                message: 'Discord bot is running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            }));
        } else if (req.url === '/' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({
                message: 'Chacko Mash Discord Bot',
                status: 'Running',
                endpoints: {
                    health: '/health'
                }
            }));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: 'Not Found',
                message: 'Endpoint not found'
            }));
        }
    });

    server.listen(port, () => {
        console.log(`Health check server running on port ${port}`);
        console.log(`Health check endpoint: http://localhost:${port}/health`);
    });

    return server;
}

module.exports = { startHealthServer }; 