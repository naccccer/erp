import type { StockMovement } from '../entities/stock-movement.entity.ts';
import type { IStockMovementRepository } from '../infra/stock-movement.repository.ts';

export interface DomainEventHandlerRegistration<TEventName extends string> {
  eventName: TEventName;
  handlerMethod: 'handle';
}

export function defineDomainEventHandlerRegistration<TEventName extends string>(
  eventName: TEventName,
): DomainEventHandlerRegistration<TEventName> {
  return {
    eventName,
    handlerMethod: 'handle',
  };
}

export function assertSupportedEventName(
  expectedEventName: string,
  actualEventName: string,
  errorMessage: string,
): void {
  if (expectedEventName !== actualEventName) {
    throw new Error(errorMessage);
  }
}

export interface StockMovementIdempotencyGuardInput {
  eventName: string;
  referenceId: string;
  tenantId: string;
  stockMovementRepository: IStockMovementRepository;
  persist: () => Promise<StockMovement[]>;
}

export async function withStockMovementIdempotencyGuard(
  input: StockMovementIdempotencyGuardInput,
): Promise<StockMovement[]> {
  const existingMovements = await input.stockMovementRepository.findByReference(
    input.tenantId,
    input.referenceId,
  );
  const existingEventMovements = existingMovements.filter(
    (movement) =>
      movement.reference_type === input.eventName && movement.tenant_id === input.tenantId,
  );

  if (existingEventMovements.length > 0) {
    return existingEventMovements;
  }

  return input.persist();
}
