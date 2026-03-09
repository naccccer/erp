import type { EventEmitter2 } from '@nestjs/event-emitter';

import type { DomainEvent } from '../../../../../packages/contracts/src/events/domain-event.ts';

export async function publishDomainEvents(
  eventEmitter: EventEmitter2,
  events: ReadonlyArray<DomainEvent>,
): Promise<void> {
  for (const event of events) {
    await eventEmitter.emitAsync(event.name, event.payload);
  }
}
