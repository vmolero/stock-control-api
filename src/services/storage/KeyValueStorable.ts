interface KeyValueStorable {
  get(key: string): Promise<string>
  put(key: string, value: string, ttl?: number): Promise<void>
  has(key: string): Promise<boolean>
  clear(): Promise<void>
}

export default KeyValueStorable
