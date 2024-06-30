import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import CryptoService from './services/CryptoService.ts'
import DatabaseService from './services/DatabaseService.ts'
import BootstrapService from './services/BootstrapService.ts'
import { sayHello } from 'sayhello'
import dex from 'dex-migrations'

const api = new Hono()
const crypto = CryptoService.createCryptoService()
const databaseService = DatabaseService.getInstance()

const bootstrapService = new BootstrapService()

await bootstrapService.bootstrap()

api.use(logger())
api.use('/api/*', cors())
api.get('/api/health-check', async (c) => {
  try {
    const [res]: { id: number; createdAt: Date }[] = await databaseService
      .query<{ id: number; createdAt: Date }>(
        'select * from healthcheck',
      )
    const helloMessage = await crypto.encrypt(res.createdAt.toISOString())
    return c.text(`Health Check OK! ${await crypto.decrypt(helloMessage)}`)
  } catch (err) {
    return c.text(err.message)
  }
})

api.get('/api/name/:name', async (c) => {
  try {
    const name = c.req.param('name')
    const meta = await dex.init()
    console.debug(JSON.stringify(meta, null, 2))

    return c.text(sayHello(name))
  } catch (err) {
    return c.text(err.message)
  }
})

api.notFound((c) => c.json({ message: 'Not Found' }, 404))

export default api
