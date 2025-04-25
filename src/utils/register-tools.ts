import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenAPIV3 } from 'openapi-types';
import { z } from 'zod';

/**
 * Register tools from OpenAPI specification
 */
export const registerTools = async (
  server: McpServer,
  openApiDoc: OpenAPIV3.Document,
  baseUrl: string,
  callTool: (
    toolInfo: {
      toolId: string;
      description: string;
      inputSchema: Record<string, z.ZodType>;
      method: OpenAPIV3.HttpMethods;
      path: string;
    },
    params: Record<string, any>,
    operationObject: OpenAPIV3.OperationObject,
  ) => Promise<any>,
) => {
  for (const [path, pathItem] of Object.entries(openApiDoc.paths)) {
    if (!pathItem) continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'parameters' || typeof operation !== 'object') continue;

      // TODO handle when operation is a array

      if (Array.isArray(operation)) {
        continue;
      }

      const cleanPath = path.replace(/^\//, '');
      const toolId = `${method.toUpperCase()}-${cleanPath}`.replace(
        /[^a-zA-Z0-9-]/g,
        '-',
      );

      // XXX change to send logging message only when not in production
      // server.server.sendLoggingMessage({
      //   level: 'info',
      //   message: toolId,
      // });

      /** the parameter has a name and in */
      const validParameters =
        operation?.parameters?.filter(
          (param) => 'name' in param && 'in' in param,
        ) || [];

      /** request body */
      const requestBody = (() => {
        if (!operation.requestBody) {
          return undefined;
        }

        if (!('content' in operation.requestBody)) {
          return undefined;
        }

        // TODO handle when requestBody is not a reference object

        if (!operation.requestBody?.content?.['application/json'].schema) {
          return undefined;
        }

        const { content } = operation.requestBody;
        if (!content) {
          return undefined;
        }

        if (
          !content['application/json'].schema ||
          !('$ref' in content['application/json'].schema)
        ) {
          return undefined;
        }

        const schemaName = content['application/json'].schema.$ref
          .split('/')
          .pop();

        if (!schemaName) {
          return undefined;
        }

        const schema = openApiDoc.components?.schemas?.[schemaName];
        if (!schema) {
          return undefined;
        }

        return schema;
      })();

      const requestBodyInputSchema = (() => {
        if (!requestBody) {
          return undefined;
        }

        if (!('properties' in requestBody)) {
          return undefined;
        }

        return Object.fromEntries(
          Object.entries(requestBody.properties || {}).map(([key, value]) => {
            const { type, required } = value as OpenAPIV3.SchemaObject;
            const requestBodyKey = `requestBody-${key}`;
            switch (type) {
              case 'object':
                return [
                  requestBodyKey,
                  required ? z.object({}) : z.object({}).optional(),
                ];
              case 'string':
                return [
                  requestBodyKey,
                  required ? z.string() : z.string().optional(),
                ];
              case 'number':
                return [
                  requestBodyKey,
                  required ? z.number() : z.number().optional(),
                ];
              case 'integer':
                return [
                  requestBodyKey,
                  required ? z.number() : z.number().optional(),
                ];
              case 'boolean':
                return [
                  requestBodyKey,
                  required ? z.boolean() : z.boolean().optional(),
                ];
              default:
                return [
                  requestBodyKey,
                  required ? z.any() : z.any().optional(),
                ];
            }
          }),
        );
      })();

      // Create input schema from parameters
      const inputSchema: Record<string, z.ZodType> = {
        ...Object.fromEntries(
          validParameters.map((param) => {
            const key = param.name;
            const value = (() => {
              const { schema, required } = param;
              if (!schema) {
                return required ? z.string() : z.string().optional();
              }

              if ('$ref' in schema) {
                // TODO: handle reference objects
                return required ? z.any() : z.any().optional();
              }

              if (schema.type === 'array') {
                // TODO: handle array types
                return required
                  ? z.array(z.any())
                  : z.array(z.any()).optional();
              }

              if (schema.type === undefined) {
                // TODO: handle undefined types
                return required ? z.any() : z.any().optional();
              }

              const schemaValueMap = {
                object: z.object({}),
                string: z.string(),
                number: z.number(),
                integer: z.number(),
                boolean: z.boolean(),
              };
              return required
                ? schemaValueMap[schema.type]
                : schemaValueMap[schema.type].optional();
            })();
            return [key, value];
          }),
        ),
        ...requestBodyInputSchema,
      };

      const description =
        operation.summary ||
        operation.description ||
        `${method.toUpperCase()} ${path}`;

      // Register the tool
      server.tool(toolId, description, inputSchema, async (params) => {
        const data = await callTool(
          {
            toolId,
            description,
            inputSchema,
            method: method as OpenAPIV3.HttpMethods,
            path,
          },
          params,
          operation,
        );

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      });
    }
  }
};
