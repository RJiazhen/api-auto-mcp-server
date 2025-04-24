import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/** default config */
const DEFAULT_CONFIG = {
  /** the url of the openapi file */
  openapiUrl: '',
  /** the cookie to use for the api */
  cookie: '',
} as const;

/** the map of the config keys to the environment variables */
const CONFIG_KEYS_TO_ENV_VARS: Record<keyof typeof DEFAULT_CONFIG, string> = {
  openapiUrl: 'API_AUTO_OPENAPI_URL',
  cookie: 'API_AUTO_COOKIE',
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
    .option('cookie', {
      type: 'string',
      description: 'Cookie to use for the api',
    })
    .parseSync();

  const keyList = Object.keys(
    DEFAULT_CONFIG,
  ) as (keyof typeof DEFAULT_CONFIG)[];

  const config = Object.fromEntries(
    keyList.map((key) => {
      const configValue = configOfArgs[key] ?? configOfEnvVars[key];
      if (!configValue) {
        throw new Error(`${key} is not set`);
      }
      return [key, configValue];
    }),
  );

  if (!config.openapiUrl) {
    throw new Error('OPENAPI_URL is not set');
  }

  return config;
};
