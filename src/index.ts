import { getConfig } from '@/utils/get-config.js';
import { parseOpenApi } from '@/utils/parse-openapi.js';
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const main = async () => {
  // Create an MCP server
  const server = new McpServer({
    name: 'Demo',
    version: '1.0.0',
  });

  const config = getConfig();

  const apiObject = await parseOpenApi(config.openapiUrl);

  // TODO batch register tools by apiObject

  // Add an addition tool
  server.tool('add', { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: 'text', text: String(a + b) }],
  }));

  // Add a dynamic greeting resource
  server.resource(
    'greeting',
    new ResourceTemplate('greeting://{name}', { list: undefined }),
    async (uri, { name }) => ({
      contents: [
        {
          uri: uri.href,
          text: `Hello, ${name}!`,
        },
      ],
    }),
  );

  server.server.registerCapabilities({
    logging: {
      level: 'info',
      message: 'Server started',
    },
  });

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main();
