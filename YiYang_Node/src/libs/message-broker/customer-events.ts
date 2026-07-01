import { randomUUID } from 'node:crypto'
import { CUSTOMER_EVENT_TYPES, type DomainEvent } from './domain-event.types.js'

type BedDeletedPayload = {
  bedId: number
  roomId: number
  bedNo: string
}

type OutingCreatedPayload = {
  outingId: number
  residentId: number
  residentName: string
  destination?: string | null
  startAt: Date
  expectedReturnAt?: Date | null
}

type OutingReturnedPayload = {
  outingId: number
  residentId: number
  residentName: string
  actualReturnAt: Date
}

function createBaseEvent(
  eventType: DomainEvent['eventType'],
  action: string,
  summary: string,
  payload: DomainEvent['payload']
): DomainEvent {
  return {
    eventId: randomUUID(),
    eventType,
    module: 'customer',
    action,
    occurredAt: new Date().toISOString(),
    summary,
    payload,
  }
}

export function createBedDeletedEvent(payload: BedDeletedPayload) {
  return createBaseEvent(
    CUSTOMER_EVENT_TYPES.bedDeleted,
    'bed.deleted',
    `床位 ${payload.bedNo} 已删除`,
    payload
  )
}

export function createOutingCreatedEvent(payload: OutingCreatedPayload) {
  return createBaseEvent(
    CUSTOMER_EVENT_TYPES.outingCreated,
    'outing.created',
    `${payload.residentName} 已办理外出登记`,
    {
      ...payload,
      startAt: payload.startAt.toISOString(),
      expectedReturnAt: payload.expectedReturnAt?.toISOString() ?? null,
    }
  )
}

export function createOutingReturnedEvent(payload: OutingReturnedPayload) {
  return createBaseEvent(
    CUSTOMER_EVENT_TYPES.outingReturned,
    'outing.returned',
    `${payload.residentName} 已办理归院登记`,
    {
      ...payload,
      actualReturnAt: payload.actualReturnAt.toISOString(),
    }
  )
}
