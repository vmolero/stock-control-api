import {
  ClientOptions,
  Pool,
  QueryArguments,
  QueryObjectOptions,
} from 'postgres'
import config from '../config.ts'

type DatabaseConfiguration = {
  database: string
  hostname: string
  password: string
  port: number
  user: string
}

class DatabaseService {
  private dbPool: Pool
  private static instance: DatabaseService | undefined
  public static getInstance() {
    if (!DatabaseService.instance) {
      const connectionString = config.db.connectionString
      const stringExp = new RegExp(
        /postgres:\/\/(.+):(.+)@(.+):(\d+)\/(\w+)/,
      )
      const result: RegExpExecArray | null = stringExp.exec(
        connectionString,
      )
      if (!result) {
        throw new Error(
          `Failed to initialize DatabaseService. Connection string mal formed`,
        )
      }
      const [_, user, password, hostname, port, database] = result
      DatabaseService.instance = new DatabaseService({
        database,
        hostname,
        password,
        port: Number(port),
        user,
      })
    }
    return DatabaseService.instance
  }
  private constructor(options: DatabaseConfiguration) {
    const configuration: ClientOptions = {
      database: options.database,
      hostname: options.hostname,
      password: options.password,
      port: options.port,
      user: options.user,
      connection: {
        attempts: config.db.connectionAttempts,
      },
    }
    this.dbPool = new Pool(
      configuration,
      config.db.connectionPoolNumber,
      true,
    )
  }

  public async query<T>(query: string, params?: QueryArguments): Promise<T[]> {
    using client = await this.dbPool.connect()
    const { rows } = await client.queryObject<T>(
      { camelCase: true, text: query, args: params } as QueryObjectOptions,
    )

    return rows
  }
}

export default DatabaseService
