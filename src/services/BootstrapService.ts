import config from '../config.ts'
import DatabaseService from './DatabaseService.ts'
import log from './LogService.ts'
import RetryService from './RetryService.ts'
import RedisKeyValueService from './storage/RedisKeyValueService.ts'

async function checkKeyValueStorage() {
  switch (config.app.keyValueStore) {
    case 'redis': {
      const redis = await RedisKeyValueService.createKeyValueService()
      return redis.ping('ACK')
    }
    case 'kv':
    case 'db':
    default:
      log.warn(`KeyValue Storage check not implemented`)
      return
  }
}

class BootstrapService {
  async bootstrap() {
    const retryService = RetryService.getInstance()
    const database = DatabaseService.getInstance()

    await Promise.all([
      retryService.retry<void>(() => database.healthCheck(), {
        name: 'database.healthCheck',
        attempts: 10,
        delay: 1000,
      }),
      retryService.retry<string | undefined>(() => checkKeyValueStorage(), {
        name: 'redis.ping',
        attempts: 10,
        delay: 1000,
      }),
    ])
  }
}

export default BootstrapService
