import * as log from '@std/log'

log.setup({
  //define handlers
  handlers: {
    console: new log.ConsoleHandler('DEBUG', {
      formatter: (record: log.LogRecord) =>
        `${record.datetime.toISOString()} [${record.levelName}] ${record.msg}`,
      useColors: true,
    }),
  },

  //assign handlers to loggers
  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['console'],
    },
    client: {
      level: 'INFO',
      handlers: ['file'],
    },
  },
})

export default log
