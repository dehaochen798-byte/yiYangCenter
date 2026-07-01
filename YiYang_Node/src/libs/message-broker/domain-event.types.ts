export const CUSTOMER_EVENT_TYPES = {
  bedDeleted: 'customer.bed.deleted',
  outingCreated: 'customer.outing.created',
  outingReturned: 'customer.outing.returned',
} as const

export type CustomerEventType =
  (typeof CUSTOMER_EVENT_TYPES)[keyof typeof CUSTOMER_EVENT_TYPES]

export type DomainEventPayload = Record<string, unknown>

export type DomainEvent = {
  eventId: string
  eventType: CustomerEventType
  module: 'customer'
  action: string
  occurredAt: string
  summary: string
  payload: DomainEventPayload
}

export interface MessageBrokerService {
  publish(event: DomainEvent): Promise<void>
}
