import { Pool, QueryArguments, QueryObjectOptions } from 'postgres'
import config from '../config.ts'

const POOL_CONNECTIONS = 20

type DatabaseConfiguration = {
  database: string
  hostname: string
  password: string
  port: number
  user: string
  poolConnections: number
}

class DatabaseService {
  private dbPool: Pool
  private static instance: DatabaseService | undefined
  public static getInstance() {
    if (!DatabaseService.instance) {
      const connectionString = config.db.connectionString
      const stringExp = new RegExp(
        /postgres:\/\/(.+):(.+)@(.+):(\d+)\/postgres/,
      )
      const result: RegExpExecArray | null = stringExp.exec(
        connectionString,
      )
      if (!result) {
        throw new Error(
          `Failed to initialize DatabaseService. Connection string mal formed`,
        )
      }
      const [_, user, password, hostname, port] = result
      DatabaseService.instance = new DatabaseService({
        database: 'public',
        hostname,
        password,
        port: Number(port),
        user,
        poolConnections: POOL_CONNECTIONS,
      })
    }
    return DatabaseService.instance
  }
  private constructor(options: DatabaseConfiguration) {
    this.dbPool = new Pool(
      options,
      options.poolConnections,
    )
  }

  public async query<T>(query: string, params: QueryArguments): Promise<T[]> {
    using client = await this.dbPool.connect()
    const { rows } = await client.queryObject<T>(
      { camelCase: true, text: query, args: params } as QueryObjectOptions,
    )

    return rows
  }
}

export default DatabaseService
