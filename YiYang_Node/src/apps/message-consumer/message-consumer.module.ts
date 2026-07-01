import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../../config/app.config.js'
import { PrismaModule } from '../../prisma/prisma.module.js'
import { AuditLogWriterService } from './audit-log-writer.service.js'
import { RedisStreamConsumerService } from './redis-stream-consumer.service.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
  ],
  providers: [AuditLogWriterService, RedisStreamConsumerService],
})
export class MessageConsumerModule {}
