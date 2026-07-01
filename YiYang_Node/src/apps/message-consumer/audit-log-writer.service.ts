import { Injectable } from '@nestjs/common'
import type { Prisma } from '../../../generated/prisma/client.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import type { DomainEvent } from '../../libs/message-broker/domain-event.types.js'

@Injectable()
export class AuditLogWriterService {
  constructor(private readonly prisma: PrismaService) {}

  async write(event: DomainEvent) {
    await this.prisma.auditLog.upsert({
      where: {
        eventId: event.eventId,
      },
      update: {},
      create: {
        eventId: event.eventId,
        eventType: event.eventType,
        module: event.module,
        action: event.action,
        summary: event.summary,
        payload: event.payload as Prisma.InputJsonValue,
        createdAt: new Date(event.occurredAt),
      },
    })
  }
}
