import { Injectable } from '@nestjs/common'
import { LocalEnvConfigCenter } from '../../libs/config-center/local-env-config-center.js'
import type { DomainEvent } from '../../libs/message-broker/domain-event.types.js'
import { RedisRespClient } from '../../libs/message-broker/redis-resp.js'
import { AuditLogWriterService } from './audit-log-writer.service.js'

type StreamMessage = {
  id: string
  fields: Record<string, string>
}

@Injectable()
export class RedisStreamConsumerService {
  private readonly config = new LocalEnvConfigCenter().getMessageBrokerConfig()
  private readonly client = new RedisRespClient(this.config.redisUrl)
  private lastMessageId = '$'
  private running = false

  constructor(private readonly auditLogWriter: AuditLogWriterService) {}

  async start() {
    this.running = true
    console.log(`[message-consumer] listening ${this.config.streamKey}`)

    while (this.running) {
      try {
        const messages = await this.readMessages()

        for (const message of messages) {
          await this.handleMessage(message)
          this.lastMessageId = message.id
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[message-consumer] consume failed: ${message}`)
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
  }

  async stop() {
    this.running = false
    await this.client.close()
  }

  private async readMessages() {
    const response = await this.client.send([
      'XREAD',
      'BLOCK',
      '5000',
      'COUNT',
      '10',
      'STREAMS',
      this.config.streamKey,
      this.lastMessageId,
    ])

    return this.parseStreamResponse(response)
  }

  private parseStreamResponse(response: unknown) {
    if (!Array.isArray(response)) {
      return []
    }

    const stream = response[0]

    if (!Array.isArray(stream) || !Array.isArray(stream[1])) {
      return []
    }

    return stream[1].flatMap((entry): StreamMessage[] => {
      if (
        !Array.isArray(entry) ||
        typeof entry[0] !== 'string' ||
        !Array.isArray(entry[1])
      ) {
        return []
      }

      const fields: Record<string, string> = {}

      for (let index = 0; index < entry[1].length; index += 2) {
        const key = entry[1][index]
        const value = entry[1][index + 1]

        if (typeof key === 'string' && typeof value === 'string') {
          fields[key] = value
        }
      }

      return [
        {
          id: entry[0],
          fields,
        },
      ]
    })
  }

  private async handleMessage(message: StreamMessage) {
    const rawEvent = message.fields.event

    if (!rawEvent) {
      return
    }

    const event = JSON.parse(rawEvent) as DomainEvent
    await this.auditLogWriter.write(event)

    console.log(
      `[message-consumer] ${event.eventType} eventId=${event.eventId} summary=${event.summary}`
    )
  }
}
