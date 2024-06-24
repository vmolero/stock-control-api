import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import CryptoService from './services/CryptoService.ts'
import DatabaseService from './services/DatabaseService.ts'
import BootstrapService from './services/BootstrapService.ts'

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

api.notFound((c) => c.json({ message: 'Not Found' }, 404))

export default api
