import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AuditLogWriterService } from '../src/apps/message-consumer/audit-log-writer.service.js'
import { createBedDeletedEvent } from '../src/libs/message-broker/index.js'

describe('AuditLogWriterService', () => {
  it('maps domain event to AuditLog upsert payload', async () => {
    const calls: unknown[] = []
    const prisma = {
      auditLog: {
        upsert: async (payload: unknown) => {
          calls.push(payload)
        },
      },
    }
    const writer = new AuditLogWriterService(prisma as never)
    const event = createBedDeletedEvent({
      bedId: 7,
      roomId: 3,
      bedNo: 'B床',
    })

    await writer.write(event)

    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0], {
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
        payload: event.payload,
        createdAt: new Date(event.occurredAt),
      },
    })
  })
})
