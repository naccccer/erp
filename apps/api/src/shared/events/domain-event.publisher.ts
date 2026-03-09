import { Logger } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';

import type { DomainEvent } from '../../../../../packages/contracts/src/events/domain-event.ts';

const logger = new Logger('DomainEventPublisher');

function summarizePayload(payload: DomainEvent['payload']): {
  tenant_id: string | undefined;
  reference_id: string | undefined;
  item_count: number | undefined;
} {
  if (!payload || typeof payload !== 'object') {
    return {
      tenant_id: undefined,
      reference_id: undefined,
      item_count: undefined,
    };
  }

  const payloadRecord = payload as Record<string, unknown>;
  const referenceIdCandidate = payloadRecord.invoice_id ?? payloadRecord.reference_id;

  return {
    tenant_id:
      payloadRecord.tenant_id === undefined ? undefined : String(payloadRecord.tenant_id),
    reference_id: referenceIdCandidate === undefined ? undefined : String(referenceIdCandidate),
    item_count: Array.isArray(payloadRecord.items) ? payloadRecord.items.length : undefined,
  };
}

async function invokeListener(
  eventEmitter: EventEmitter2,
  listener: (...args: unknown[]) => unknown,
  payload: DomainEvent['payload'],
): Promise<void> {
  await Reflect.apply(listener, eventEmitter, [payload]);
}

export async function publishDomainEvents(
  eventEmitter: EventEmitter2,
  events: ReadonlyArray<DomainEvent>,
): Promise<void> {
  for (const event of events) {
    const payloadSummary = summarizePayload(event.payload);
    const listeners = eventEmitter.listeners(event.name) as Array<(...args: unknown[]) => unknown>;

    if (listeners.length === 0) {
      logger.log(
        JSON.stringify({
          event_name: event.name,
          payload_summary: payloadSummary,
          handler_outcome: 'no_handlers',
        }),
      );
      continue;
    }

    const outcomes = await Promise.allSettled(
      listeners.map((listener) => invokeListener(eventEmitter, listener, event.payload)),
    );

    outcomes.forEach((outcome, handlerIndex) => {
      if (outcome.status === 'fulfilled') {
        logger.log(
          JSON.stringify({
            event_name: event.name,
            payload_summary: payloadSummary,
            handler_index: handlerIndex,
            handler_outcome: 'success',
          }),
        );
        return;
      }

      logger.error(
        JSON.stringify({
          event_name: event.name,
          payload_summary: payloadSummary,
          handler_index: handlerIndex,
          handler_outcome: 'failure',
          error_message:
            outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
        }),
      );
    });
  }
}
