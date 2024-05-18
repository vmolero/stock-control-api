import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "@std/testing/mock";

import RedisKeyValueService, {
  MinimumRedisProps
} from '../../../../src/services/storage/RedisKeyValueService.ts'

const RedisMock: MinimumRedisProps = {
  get: (key: string) => Promise.resolve('there'),
  set: (_key: string, value: string, _opts?: { ex: number }) =>
    Promise.resolve(value),
  exists: () => Promise.resolve(1),
  flushall: () => Promise.resolve('bye'),
  del: () => Promise.resolve(1),
  close: async () => {}
}

Deno.test('it should call redis set with default ttl', async () => {
  const spyRedisSet = spy(RedisMock, "set")
  const redisKeyValueService = new RedisKeyValueService({ redis: RedisMock })
  
  await redisKeyValueService.put('hi', 'there')

  assertSpyCall(spyRedisSet, 0, {
    args: ['hi', 'there', { ex: 600 }]
  })
  assertSpyCalls(spyRedisSet, 1)
  spyRedisSet.restore()
})

Deno.test('it should call redis set with specific ttl 123', async () => {
  const spyRedisSet = spy(RedisMock, 'set')
  const redisKeyValueService = new RedisKeyValueService({ redis: RedisMock })

  await redisKeyValueService.put('hi', 'there', 123000)

  assertSpyCall(spyRedisSet, 0, {
    args: ['hi', 'there', { ex: 123 }]
  })
  assertSpyCalls(spyRedisSet, 1)
  spyRedisSet.restore()
})

Deno.test('it should call redis get', async () => {
  const spyRedisGet = spy(RedisMock, 'get')
  const redisKeyValueService = new RedisKeyValueService({ redis: RedisMock })

  await redisKeyValueService.get('hi')

  assertSpyCalls(spyRedisGet, 1)
  spyRedisGet.restore()
})
