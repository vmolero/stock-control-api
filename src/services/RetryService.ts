import * as retry from 'retry'
import log from './LogService.ts'

type RetryConfiguration = {
  attempts: number
  delay: number
  name: string
}

class RetryService {
  private static instance: RetryService | undefined
  public static getInstance() {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService()
    }
    return RetryService.instance
  }
  public async retry<T>(
    fn: (...args: any[]) => Promise<T>,
    options: RetryConfiguration,
  ) {
    log.info(
      `Retry ${options.name} [attempts=${options.attempts}, delay=${options.delay}]`,
    )
    const asyncFn = retry.retryAsyncDecorator<
      (...args: any[]) => Promise<T>
    >(
      fn,
      {
        maxTry: options.attempts,
        delay: options.delay,
      } as retry.RetryOptions<(...args: any[]) => Promise<T>>,
    )
    const fnResult = await asyncFn()

    return fnResult as T
  }
}

export default RetryService
