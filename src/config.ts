import { load } from '@std/dotenv'

const envConfig = await load()
const defaultPort = 8087

type RetryConfig = {
  attempts?: number
  delay?: number
}

class Config {
  public app: { port: number; environment: string; keyValueStore: string }
  public keyValueService: { defaultTtl: number }
  public cryptoService: {
    key: string
    iv: string
    mode: string
  }
  public redis: {
    host: string
    username: string
    password: string
    port: number
    retryConfig: RetryConfig
  }
  public db: {
    connectionString: string
    connectionAttempts: number
    connectionPoolNumber: number
    retryConfig: RetryConfig
  }

  static createConfig() {
    return new Config(envConfig)
  }

  constructor(envConfig: Record<string, string>) {
    this.app = {
      port: Number(envConfig['PORT'] || defaultPort),
      environment: envConfig['ENVIRONMENT'] || 'development',
      keyValueStore: envConfig['KEY_VALUE_STORE'] || 'db',
    }
    this.cryptoService = {
      key: envConfig['CRYPTO_SERVICE_KEY'],
      iv: envConfig['CRYPTO_SERVICE_IV'],
      mode: envConfig['CRYPTO_SERVICE_MODE'],
    }
    this.redis = {
      host: envConfig['REDIS_HOST'],
      username: envConfig['REDIS_USERNAME'],
      password: envConfig['REDIS_PASSWORD'],
      port: Number(envConfig['REDIS_PORT']),
      retryConfig: {
        attempts: Number(envConfig['REDIS_BOOTSTRAP_ATTEMPTS'] || 10),
        delay: Number(envConfig['REDIS_BOOTSTRAP_DELAY'] || 1000),
      },
    }
    this.keyValueService = {
      // In milliseconds
      defaultTtl: (Number(envConfig['KEY_VALUE_DEFAULT_TTL']) || 600) * 1000,
    }
    this.db = {
      connectionString: envConfig['DATABASE_URL'],
      connectionAttempts: envConfig['DATABASE_CONNECTION_ATTEMPTS']
        ? Number(envConfig['DATABASE_CONNECTION_ATTEMPTS'])
        : 5,
      connectionPoolNumber: envConfig['DATABASE_CONNECTION_POOL_NUMBER']
        ? Number(envConfig['DATABASE_CONNECTION_POOL_NUMBER'])
        : 20,
      retryConfig: {
        attempts: Number(envConfig['DATABASE_BOOTSTRAP_ATTEMPTS'] || 10),
        delay: Number(envConfig['DATABASE_BOOTSTRAP_DELAY'] || 1000),
      },
    }
  }
}

export default Config.createConfig()
