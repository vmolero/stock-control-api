import {
  assertEquals,
  assertRejects,
  assertNotEquals
} from '@std/assert'
import CryptoService from '../../../src/services/CryptoService.ts'

Deno.test('it should encrypt and decrypt a message', async () => {
  const cryptoService = new CryptoService({
    key: '1111111111111111',
    iv: 'aaaaaaaaaaaaaaaa',
    mode: 'AES-CBC',
    length: 256
  })
  const originalMessage = 'This is a very important message'
  const base64encrypted = await cryptoService.encrypt(originalMessage)
  const decrypted = await cryptoService.decrypt(base64encrypted)
  assertEquals(
    base64encrypted,
    'H2prB+K5CQ3zKpaE3QuqpJWmXm3UlYZDE7ch41pRpHmO6kBt4zIirkHThO1RTD5V'
  )
  assertEquals(decrypted, originalMessage)
})

Deno.test('it should fail to decrypt using a different key', async () => {
  const cryptoService1 = new CryptoService({
    key: '1111111111111111',
    iv: 'aaaaaaaaaaaaaaaa',
    mode: 'AES-CBC',
    length: 256
  })
  const originalMessage = 'This is a very important message'
  const base64encrypted = await cryptoService1.encrypt(originalMessage)
  const cryptoService2 = new CryptoService({
    key: '2222222222222222',
    iv: 'aaaaaaaaaaaaaaaa',
    mode: 'AES-CBC',
    length: 256
  })

  await assertRejects(async () => {
    await cryptoService2.decrypt(base64encrypted)
  })
})

Deno.test(
  'it should fail to decrypt using a different initialization vector',
  async () => {
    const cryptoService1 = new CryptoService({
      key: '1111111111111111',
      iv: 'aaaaaaaaaaaaaaaa',
      mode: 'AES-CBC',
      length: 256
    })
    const originalMessage = 'This is a very important message'
    const base64encrypted = await cryptoService1.encrypt(originalMessage)
    const cryptoService2 = new CryptoService({
      key: '1111111111111111',
      iv: 'AYHS73NHkuslio96',
      mode: 'AES-CBC',
      length: 256
    })
    const decrypted = await cryptoService2.decrypt(base64encrypted)
    assertNotEquals(decrypted, originalMessage)
  }
)

Deno.test(
  'it should successfully decrypt using the same key and initialization vector',
  async () => {
    const cryptoService1 = new CryptoService({
      key: '1111111111111111',
      iv: 'aaaaaaaaaaaaaaaa',
      mode: 'AES-CBC',
      length: 256
    })
    const originalMessage = 'This is a very important message'
    const base64encrypted = await cryptoService1.encrypt(originalMessage)
    const cryptoService2 = new CryptoService({
      key: '1111111111111111',
      iv: 'aaaaaaaaaaaaaaaa',
      mode: 'AES-CBC',
      length: 256
    })
    const decrypted = await cryptoService2.decrypt(base64encrypted)
    assertEquals(decrypted, originalMessage)
  }
)
