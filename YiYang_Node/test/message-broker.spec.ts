import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CUSTOMER_EVENT_TYPES,
  LocalMessageBroker,
  createBedDeletedEvent,
  createOutingCreatedEvent,
  createOutingReturnedEvent,
} from '../src/libs/message-broker/index.js'

describe('message broker events', () => {
  it('builds A group customer events with required fields', () => {
    const event = createOutingCreatedEvent({
      outingId: 10,
      residentId: 2,
      residentName: '张三',
      destination: '人民公园',
      startAt: new Date('2026-07-01T08:00:00.000Z'),
      expectedReturnAt: new Date('2026-07-01T18:00:00.000Z'),
    })

    assert.equal(event.eventType, CUSTOMER_EVENT_TYPES.outingCreated)
    assert.equal(event.module, 'customer')
    assert.equal(event.action, 'outing.created')
    assert.equal(event.summary, '张三 已办理外出登记')
    assert.equal(event.payload.outingId, 10)
    assert.equal(event.payload.residentId, 2)
    assert.equal(event.payload.destination, '人民公园')
    assert.ok(event.eventId)
    assert.ok(event.occurredAt)
  })

  it('stores events in local broker for tests', async () => {
    const broker = new LocalMessageBroker()
    const bedEvent = createBedDeletedEvent({
      bedId: 1,
      roomId: 2,
      bedNo: 'A床',
    })
    const returnEvent = createOutingReturnedEvent({
      outingId: 3,
      residentId: 4,
      residentName: '李四',
      actualReturnAt: new Date('2026-07-01T10:00:00.000Z'),
    })

    await broker.publish(bedEvent)
    await broker.publish(returnEvent)

    assert.deepEqual(
      broker.events.map((event) => event.eventType),
      [CUSTOMER_EVENT_TYPES.bedDeleted, CUSTOMER_EVENT_TYPES.outingReturned]
    )
  })
})
