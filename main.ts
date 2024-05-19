import api from './src/api.ts'
import config from './src/config.ts'
import log from './src/services/LogService.ts'

Deno.serve(
  {
    port: config.app.port,
    onListen: (localAddress: Deno.NetAddr) => {
      log.info(
        `API listening on ${localAddress.hostname}:${localAddress.port}`,
      )
    },
  },
  api.fetch,
)
