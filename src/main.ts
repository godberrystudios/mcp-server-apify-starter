import { Actor } from 'apify';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type Request, type Response } from 'express';
import { registerTools } from './tools.js';

await Actor.init();

function createServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-server-apify-starter',
    version: '0.1.0',
    description: 'Example MCP server deployed on Apify with pay-per-event billing.',
  });
  registerTools(server);
  return server;
}

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'mcp-server-apify-starter', version: '0.1.0' });
});

app.post('/mcp', async (req: Request, res: Response) => {
  const server = createServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.get('/mcp', (_req, res) => {
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  }));
});

app.delete('/mcp', (_req, res) => {
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  }));
});

const port = parseInt(
  process.env.ACTOR_STANDBY_PORT || process.env.APIFY_STANDBY_PORT || '4321',
  10,
);

app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await Actor.exit();
});
