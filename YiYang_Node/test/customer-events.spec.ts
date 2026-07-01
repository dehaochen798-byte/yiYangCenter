import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BedStatus,
  Gender,
  OutingStatus,
  ResidenceStatus,
} from '../generated/prisma/enums.js'
import { CustomerService } from '../src/modules/customer/customer.service.js'
import {
  CUSTOMER_EVENT_TYPES,
  LocalMessageBroker,
} from '../src/libs/message-broker/index.js'

describe('CustomerService A group domain events', () => {
  it('publishes event after bed deletion succeeds', async () => {
    const broker = new LocalMessageBroker()
    const prisma = createPrismaMock({
      bed: {
        findUnique: async () => ({
          id: 9,
          roomId: 2,
          bedNo: 'A床',
          isDelete: false,
          currentResident: null,
        }),
        update: async () => ({ id: 9 }),
        count: async () => 1,
      },
      room: {
        update: async () => ({}),
      },
    })
    const service = new CustomerService(prisma as never, broker)

    await service.deleteBed(9)

    assert.equal(broker.events.length, 1)
    assert.equal(broker.events[0].eventType, CUSTOMER_EVENT_TYPES.bedDeleted)
    assert.equal(broker.events[0].payload.bedId, 9)
    assert.equal(broker.events[0].payload.roomId, 2)
  })

  it('publishes event after outing creation succeeds', async () => {
    const broker = new LocalMessageBroker()
    const now = new Date('2026-07-01T08:00:00.000Z')
    const prisma = createPrismaMock({
      resident: {
        findUnique: async () => ({
          id: 3,
          fullName: '王五',
          status: ResidenceStatus.ACTIVE,
        }),
      },
      outing: {
        findFirst: async () => null,
        create: async () => ({
          id: 11,
          residentId: 3,
          destination: '医院',
          startAt: now,
          expectedReturnAt: null,
          status: OutingStatus.OUTING,
          resident: {
            fullName: '王五',
          },
        }),
      },
    })
    const service = new CustomerService(prisma as never, broker)

    await service.createOuting({
      residentId: 3,
      startAt: now.toISOString(),
      destination: '医院',
    })

    assert.equal(broker.events.length, 1)
    assert.equal(broker.events[0].eventType, CUSTOMER_EVENT_TYPES.outingCreated)
    assert.equal(broker.events[0].payload.outingId, 11)
    assert.equal(broker.events[0].payload.residentId, 3)
  })

  it('publishes event after outing return succeeds', async () => {
    const broker = new LocalMessageBroker()
    const returnedAt = new Date('2026-07-01T12:00:00.000Z')
    const prisma = createPrismaMock({
      outing: {
        findUnique: async () => ({
          id: 12,
        }),
        update: async () => ({
          id: 12,
          residentId: 5,
          actualReturnAt: returnedAt,
          resident: {
            fullName: '赵六',
          },
        }),
      },
    })
    const service = new CustomerService(prisma as never, broker)

    await service.returnOuting(12, {
      actualReturnAt: returnedAt.toISOString(),
    })

    assert.equal(broker.events.length, 1)
    assert.equal(broker.events[0].eventType, CUSTOMER_EVENT_TYPES.outingReturned)
    assert.equal(broker.events[0].payload.outingId, 12)
    assert.equal(broker.events[0].payload.residentId, 5)
  })
})

function createPrismaMock(overrides: Record<string, unknown>) {
  return {
    resident: {
      findUnique: async () => ({
        id: 1,
        age: 70,
        gender: Gender.MALE,
        fullName: '默认客户',
        status: ResidenceStatus.ACTIVE,
      }),
    },
    bed: {
      findUnique: async () => ({
        id: 1,
        roomId: 1,
        bedNo: 'A床',
        status: BedStatus.VACANT,
        isDelete: false,
        currentResident: null,
      }),
      update: async () => ({ id: 1 }),
      count: async () => 0,
    },
    room: {
      update: async () => ({}),
    },
    outing: {
      findFirst: async () => null,
      findUnique: async () => ({ id: 1 }),
      create: async () => ({ id: 1 }),
      update: async () => ({ id: 1 }),
    },
    ...overrides,
  }
}
