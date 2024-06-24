import { connect as redisConnect } from 'redis'
import config from '../../config.ts'
import log from '../LogService.ts'
import KeyValueStorable from './KeyValueStorable.ts'

export interface MinimumRedisProps {
  get(key: string): Promise<string>
  set(key: string, value: string, opts?: { ex: number }): Promise<string>
  exists(...keys: string[]): Promise<number>
  flushall(async?: boolean): Promise<string>
  del(...keys: string[]): Promise<number>
  close: () => Promise<void>
  ping: (message: string) => Promise<string>
}

class RedisKeyValueService implements KeyValueStorable {
  static async createKeyValueService(): Promise<KeyValueStorable> {
    const redisConnectionString =
      `redis://${config.redis.username}:${config.redis.password}@${config.redis.host}:${config.redis.port}/0`
    try {
      log.info(
        `Redis connection string [url=${
          redisConnectionString.replace(
            config.redis.password,
            '*****',
          )
        }]`,
      )
      const redisClient = await redisConnect({
        hostname: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        username: config.redis.username,
        db: 0,
      })

      return new RedisKeyValueService({
        redis: redisClient as unknown as MinimumRedisProps,
      }) as KeyValueStorable
    } catch (err) {
      throw new Error(
        `Redis Client Error [url=${
          redisConnectionString.replace(
            config.redis.password,
            '*****',
          )
        }]:  ${err.message}`,
      )
    }
  }
  private redis: MinimumRedisProps

  constructor(source: { redis: MinimumRedisProps }) {
    this.redis = source.redis
  }
  public async healthCheck() {
    const response = await this.redis.ping('health check')
    if (!response) {
      throw new Error(`Redis service offline`)
    }
    log.info(`Redis service online`)
  }
  async has(key: string) {
    const exists = await this.redis.exists(key)

    return !!exists
  }

  async get(key: string) {
    const result = await this.redis.get(key)

    return result as string
  }

  /**
   * @param {string} key key for the cached value
   * @param {string} value value to be stored
   * @param {number|undefined} ttl in milliseconds, time to live, if not set, falls back to default 10 min
   * @returns {Promise<void>}
   */
  async put(key: string, value: string, ttl?: number) {
    const timeToLiveInMilliseconds = ttl
      ? ttl
      : config.keyValueService.defaultTtl
    const timeToLiveInSeconds = Math.floor(timeToLiveInMilliseconds / 1000)
    try {
      await this.redis.set(key, value, { ex: timeToLiveInSeconds })
    } catch (err) {
      log.error(
        `Failed to put redis key value [key=${key}, value=${value}]: ${err.message}`,
      )
    }
  }
  delete(key: string) {
    return this.redis.del(key)
  }
  async clear() {
    await this.redis.flushall()
  }

  disconnect() {
    return this.redis.close()
  }
}

export default RedisKeyValueService
