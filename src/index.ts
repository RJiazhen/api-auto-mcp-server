#!/usr/bin/env node
import { getConfig } from '@/utils/get-config.js';
import { parseOpenApi } from '@/utils/parse-openapi.js';
import { registerTools } from '@/utils/register-tools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { OpenAPIV3 } from 'openapi-types';
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
      method: OpenAPIV3.HttpMethods;
      path: string;
    },
    params: Record<string, any>,
    operationObject: OpenAPIV3.OperationObject,
  ) => {
    // XXX extra the code of getting the params into a single utils file
    const queryParams = operationObject?.parameters
      ?.filter((param) => {
        if ('$ref' in param) {
          // TODO: handle when param is a reference
          return false;
        }

        if (param.in === 'query') {
          return param;
        }
      })
      .map((param) => {
        if ('$ref' in param) {
          // TODO: handle when param is a reference
          return false;
        }

        return {
          ...param,
          value: params[param.name],
        };
      });

    const pathParams = operationObject?.parameters
      ?.filter((param) => {
        if ('$ref' in param) {
          // TODO: handle when param is a reference
          return false;
        }

        if (param.in === 'path') {
          return param;
        }
      })
      .map((param) => {
        if ('$ref' in param) {
          // TODO: handle when param is a reference
          return false;
        }

        return {
          ...param,
          value: params[param.name],
        };
      })
      .filter(Boolean);

    const bodyParams = operationObject?.parameters
      ?.filter((param) => {
        if ('$ref' in param) {
          // TODO: handle when param is a reference
          return false;
        }

        if (param.in === 'body') {
          return param;
        }
      })
      .map((param) => {
        if ('$ref' in param) {
          // TODO: handle when param is a reference
          return false;
        }

        return {
          ...param,
          value: params[param.name],
        };
      });

    const method = toolInfo.method.toLowerCase();
    const urlWithPathParams = toolInfo.path.replace(
      /\{(\w+)\}/g,
      (match, p1) => {
        // @ts-ignore the type of pathParams is recognized as false
        const param = pathParams?.find((param) => param.name === p1);
        if (!param) {
          return match;
        }

        return param.value;
      },
    );
    const url = new URL(urlWithPathParams, baseUrl);
    url.search =
      queryParams
        ?.filter((param) => param !== false)
        .map((param) => `${param.name}=${param.value}`)
        .join('&') || '';

    server.server.sendLoggingMessage({
      level: 'info',
      message: `${method} ${toolInfo.path} ${JSON.stringify(params)}`,
      operationObject,
      parameter: operationObject.parameters,
      pathParams,
      queryParams,
      bodyParams,
    });

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      ...(method !== 'get' && { body: JSON.stringify(bodyParams) }),
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
