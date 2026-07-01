import { Socket } from 'node:net'
import { once } from 'node:events'

type RespValue = string | number | null | RespValue[]

function encodeCommand(parts: string[]) {
  return `*${parts.length}\r\n${parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('')}`
}

class RespParser {
  private offset = 0

  constructor(private readonly buffer: Buffer) {}

  parse(): RespValue {
    return this.parseValue()
  }

  private parseValue(): RespValue {
    const type = String.fromCharCode(this.buffer[this.offset])
    this.offset += 1

    if (type === '+') {
      return this.readLine()
    }

    if (type === '-') {
      throw new Error(this.readLine())
    }

    if (type === ':') {
      return Number(this.readLine())
    }

    if (type === '$') {
      const length = Number(this.readLine())

      if (length === -1) {
        return null
      }

      const value = this.buffer.toString('utf8', this.offset, this.offset + length)
      this.offset += length + 2
      return value
    }

    if (type === '*') {
      const length = Number(this.readLine())

      if (length === -1) {
        return null
      }

      return Array.from({ length }, () => this.parseValue())
    }

    throw new Error(`Unsupported RESP type: ${type}`)
  }

  private readLine() {
    const end = this.buffer.indexOf('\r\n', this.offset)
    const value = this.buffer.toString('utf8', this.offset, end)
    this.offset = end + 2
    return value
  }
}

export class RedisRespClient {
  private socket: Socket | null = null
  private readonly url: URL

  constructor(redisUrl: string) {
    this.url = new URL(redisUrl)
  }

  async send(parts: string[]) {
    const socket = await this.getSocket()

    socket.write(encodeCommand(parts))

    const [chunk] = (await once(socket, 'data')) as [Buffer]
    return new RespParser(chunk).parse()
  }

  async close() {
    this.socket?.end()
    this.socket = null
  }

  private async getSocket() {
    if (this.socket && !this.socket.destroyed) {
      return this.socket
    }

    const socket = new Socket()
    const port = Number(this.url.port || 6379)
    const host = this.url.hostname || '127.0.0.1'

    socket.connect(port, host)
    await once(socket, 'connect')

    if (this.url.password) {
      await this.authenticate(socket)
    }

    this.socket = socket
    return socket
  }

  private async authenticate(socket: Socket) {
    const password = decodeURIComponent(this.url.password)
    const username = decodeURIComponent(this.url.username)
    const parts = username ? ['AUTH', username, password] : ['AUTH', password]

    socket.write(encodeCommand(parts))
    const [chunk] = (await once(socket, 'data')) as [Buffer]
    new RespParser(chunk).parse()
  }
}
