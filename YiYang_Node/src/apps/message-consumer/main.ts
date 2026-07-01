import { NestFactory } from '@nestjs/core'
import { MessageConsumerModule } from './message-consumer.module.js'
import { RedisStreamConsumerService } from './redis-stream-consumer.service.js'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MessageConsumerModule)
  const consumer = app.get(RedisStreamConsumerService)

  const shutdown = async () => {
    await consumer.stop()
    await app.close()
    process.exit(0)
  }

  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)

  await consumer.start()
}

bootstrap()
