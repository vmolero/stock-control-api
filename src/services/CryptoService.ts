import { decodeBase64, encodeBase64 } from '@std/encoding/base64'
import { crypto } from '@std/crypto/crypto'
import config from '../config.ts'

class CryptoService {
  static createCryptoService() {
    return new CryptoService({
      key: config.cryptoService.key,
      iv: config.cryptoService.iv,
      mode: config.cryptoService.mode,
    })
  }
  private key: Uint8Array
  private iv: Uint8Array
  private mode: string
  private length: number
  private cryptoKey: CryptoKey | undefined

  constructor({
    key,
    iv,
    mode = 'AES-CBC',
    length = 256,
  }: {
    key: string
    iv: string
    mode?: string
    length?: number
  }) {
    this.key = new TextEncoder().encode(key)
    this.iv = new TextEncoder().encode(iv)
    this.mode = mode
    this.length = length
  }

  private async getCryptoKey() {
    if (!this.cryptoKey) {
      this.cryptoKey = await crypto.subtle.importKey(
        'raw',
        this.key,
        { name: this.mode, length: this.length },
        false,
        ['encrypt', 'decrypt'],
      )
    }
    return this.cryptoKey
  }

  async encrypt(text: string) {
    const cryptoKey = await this.getCryptoKey()
    const output = await crypto.subtle.encrypt(
      { name: this.mode, iv: this.iv },
      cryptoKey,
      new TextEncoder().encode(text),
    )

    return encodeBase64(output)
  }

  async decrypt(base64encrypted: string) {
    const cryptoKey = await this.getCryptoKey()
    const output = await crypto.subtle.decrypt(
      { name: this.mode, iv: this.iv },
      cryptoKey,
      decodeBase64(base64encrypted),
    )

    return new TextDecoder().decode(output)
  }
}

export default CryptoService
