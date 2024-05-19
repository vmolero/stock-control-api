import { Hono } from 'hono'
import CryptoService from './services/CryptoService.ts'
import DatabaseService from './services/DatabaseService.ts'

const api = new Hono()
const crypto = CryptoService.createCryptoService()
const databaseService = DatabaseService.getInstance()

api.get('/', async (c) => {
  try {
    const [res]: { id: number; createdAt: Date }[] = await databaseService
      .query<{ id: number; createdAt: Date }>(
        'select * from healthcheck',
      )
    const helloMessage = await crypto.encrypt(res.createdAt.toISOString())
    return c.text(`${helloMessage} => ${await crypto.decrypt(helloMessage)}`)
  } catch (err) {
    return c.text(err.message)
  }
})

export default api
