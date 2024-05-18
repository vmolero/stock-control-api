import { load } from '@std/dotenv'

const envConfig = await load()
const defaultPort = 8087

class Config {
  public app: { port: number; environment: string }
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
  }

  static createConfig() {
    return new Config(envConfig)
  }

  constructor(envConfig: Record<string, string>) {
    this.app = {
      port: Number(envConfig['PORT'] || defaultPort),
      environment: envConfig['ENVIRONMENT'] || 'development',
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
    }
    this.keyValueService = {
      // In milliseconds
      defaultTtl: (Number(envConfig['KEY_VALUE_DEFAULT_TTL']) || 600) * 1000,
    }
  }
}

export default Config.createConfig()
