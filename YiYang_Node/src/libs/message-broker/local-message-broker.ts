import type { DomainEvent, MessageBrokerService } from './domain-event.types.js'

export class LocalMessageBroker implements MessageBrokerService {
  readonly events: DomainEvent[] = []

  async publish(event: DomainEvent) {
    this.events.push(event)
  }
}
