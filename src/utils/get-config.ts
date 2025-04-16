import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/** default config */
const DEFAULT_CONFIG = {
  /** the url of the openapi file */
  openapiUrl: '',
};

/** the map of the config keys to the environment variables */
const CONFIG_KEYS_TO_ENV_VARS: Record<keyof typeof DEFAULT_CONFIG, string> = {
  openapiUrl: 'API_AUTO_OPENAPI_URL',
};

/**
 * Get the config from the environment variables
 */
export const getConfig = () => {
  const configOfEnvVars = Object.fromEntries(
    Object.entries(CONFIG_KEYS_TO_ENV_VARS).map(([key, envVar]) => [
      key,
      process.env[envVar],
    ]),
  );

  const configOfArgs = yargs(hideBin(process.argv))
    .option('openapi-url', {
      type: 'string',
      description: 'URL of the OpenAPI specification',
    })
    .parseSync();

  const config = Object.fromEntries(
    Object.entries(DEFAULT_CONFIG).map(([key, value]) => [
      key,
      configOfArgs['openapi-url'] ?? configOfEnvVars[key] ?? value,
    ]),
  );

  if (!config.openapiUrl) {
    throw new Error('OPENAPI_URL is not set');
  }

  return config;
};
