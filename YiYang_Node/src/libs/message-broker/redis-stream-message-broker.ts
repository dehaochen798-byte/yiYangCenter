import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy } from '@nestjs/common'
import { LocalEnvConfigCenter } from '../config-center/local-env-config-center.js'
import type { DomainEvent, MessageBrokerService } from './domain-event.types.js'
import { RedisRespClient } from './redis-resp.js'

@Injectable()
export class RedisStreamMessageBroker implements MessageBrokerService, OnModuleDestroy {
  private readonly config = new LocalEnvConfigCenter().getMessageBrokerConfig()
  private readonly client = new RedisRespClient(this.config.redisUrl)

  async publish(event: DomainEvent) {
    await this.client.send([
      'XADD',
      this.config.streamKey,
      '*',
      'event',
      JSON.stringify(event),
    ])
  }

  async onModuleDestroy() {
    await this.client.close()
  }
}
