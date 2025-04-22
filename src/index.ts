import { getConfig } from '@/utils/get-config.js';
import { parseOpenApi } from '@/utils/parse-openapi.js';
import { registerTools } from '@/utils/register-tools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

  const baseUrl = new URL(config.openapiUrl).origin;
  const cookie = config.cookie;

  /** the callback function for the tools */
  const toolCallback = async (
    toolInfo: {
      toolId: string;
      description: string;
      inputSchema: Record<string, z.ZodType>;
      method: string;
      path: string;
    },
    params: Record<string, any>,
  ) => {
    // TODO handle when param is in url
    const method = toolInfo.method.toLowerCase();
    const url = new URL(toolInfo.path, baseUrl).toString();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      ...(method !== 'get' && { body: JSON.stringify(params) }),
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  };
  await registerTools(server, apiObject, baseUrl, toolCallback);

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
