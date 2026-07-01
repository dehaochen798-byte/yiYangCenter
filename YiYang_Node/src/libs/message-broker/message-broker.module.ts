import { Module } from '@nestjs/common'
import { RedisStreamMessageBroker } from './redis-stream-message-broker.js'

export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER')

@Module({
  providers: [
    RedisStreamMessageBroker,
    {
      provide: MESSAGE_BROKER,
      useExisting: RedisStreamMessageBroker,
    },
  ],
  exports: [MESSAGE_BROKER, RedisStreamMessageBroker],
})
export class MessageBrokerModule {}
