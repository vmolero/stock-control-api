import DatabaseService from './DatabaseService.ts'
import RetryService from './RetryService.ts'
import RedisKeyValueService from './storage/RedisKeyValueService.ts'

class BootstrapService {
  async bootstrap() {
    const retryService = RetryService.getInstance()
    const database = DatabaseService.getInstance()
    const redis = await RedisKeyValueService.createKeyValueService()
    await Promise.all([
      retryService.retry<void>(() => database.healthCheck(), {
        name: 'database.healthCheck',
        attempts: 10,
        delay: 1000,
      }),
      retryService.retry<string>(() => redis.ping('ACK'), {
        name: 'redis.ping',
        attempts: 10,
        delay: 1000,
      }),
    ])
  }
}

export default BootstrapService
