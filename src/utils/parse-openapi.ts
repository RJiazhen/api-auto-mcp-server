import { OpenAPIV3 } from 'openapi-types';

/**
 * Parse OpenAPI JSON from a URL or file
 */
export const parseOpenApi = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
  }

  const json = (await response.json()) as OpenAPIV3.Document;
  return json;
};
