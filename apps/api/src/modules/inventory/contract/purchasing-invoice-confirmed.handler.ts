import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  PURCHASING_INVOICE_CONFIRMED_EVENT,
  type PurchasingInvoiceConfirmedEventContract,
  type PurchasingInvoiceConfirmedEventPayloadContract,
} from '../../../../../../packages/contracts/src/events/purchasing.events.ts';
import type { StockMovement } from '../entities/stock-movement.entity.ts';
import {
  STOCK_MOVEMENT_REPOSITORY,
  type IStockMovementRepository,
} from '../infra/stock-movement.repository.ts';
import {
  WAREHOUSE_REPOSITORY,
  type IWarehouseRepository,
} from '../infra/warehouse.repository.ts';
import {
  CreatePurchaseInvoiceStockInMovementsUseCase,
} from '../use-cases/create-purchase-invoice-stock-in-movements/use-case.ts';
import {
  assertSupportedEventName,
  defineDomainEventHandlerRegistration,
  withStockMovementIdempotencyGuard,
} from './event-handler.pattern.ts';

export interface PurchasingInvoiceConfirmedInventoryEventHandlerDto {
  event: PurchasingInvoiceConfirmedEventContract;
  warehouse_id: string;
}

export const PURCHASING_INVOICE_CONFIRMED_HANDLER_REGISTRATION =
  defineDomainEventHandlerRegistration(PURCHASING_INVOICE_CONFIRMED_EVENT);

@Injectable()
export class PurchasingInvoiceConfirmedInventoryEventHandler {
  private readonly logger = new Logger(PurchasingInvoiceConfirmedInventoryEventHandler.name);

  constructor(
    private readonly useCase: CreatePurchaseInvoiceStockInMovementsUseCase,
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  async execute(input: PurchasingInvoiceConfirmedInventoryEventHandlerDto): Promise<StockMovement[]> {
    assertSupportedEventName(
      PURCHASING_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
      input.event.name,
      'Unsupported purchasing event for inventory handler.',
    );

    return this.createAndPersistMovements(input.event.payload, input.warehouse_id);
  }

  @OnEvent(PURCHASING_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName)
  async handle(event: PurchasingInvoiceConfirmedEventPayloadContract): Promise<StockMovement[]> {
    const payloadSummary = this.buildPayloadSummary(event);

    try {
      const warehouse = await this.warehouseRepository.findDefaultByTenantId(event.tenant_id);

      if (!warehouse) {
        throw new Error(
          `No active warehouse found for tenant "${event.tenant_id}" while handling purchasing.invoice.confirmed.`,
        );
      }

      const movements = await this.createAndPersistMovements(event, warehouse.id);

      this.logger.log(
        JSON.stringify({
          event_name: PURCHASING_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
          payload_summary: payloadSummary,
          handler_name: PurchasingInvoiceConfirmedInventoryEventHandler.name,
          handler_outcome: 'success',
          movement_count: movements.length,
        }),
      );

      return movements;
    } catch (error: unknown) {
      this.logger.error(
        JSON.stringify({
          event_name: PURCHASING_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
          payload_summary: payloadSummary,
          handler_name: PurchasingInvoiceConfirmedInventoryEventHandler.name,
          handler_outcome: 'failure',
          error_message: error instanceof Error ? error.message : String(error),
        }),
      );

      return [];
    }
  }

  private async createAndPersistMovements(
    event: PurchasingInvoiceConfirmedEventPayloadContract,
    warehouseId: string,
  ): Promise<StockMovement[]> {
    return withStockMovementIdempotencyGuard({
      eventName: PURCHASING_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
      referenceId: event.invoice_id,
      tenantId: event.tenant_id,
      stockMovementRepository: this.stockMovementRepository,
      persist: async () => {
        const movements = this.useCase.execute({
          warehouse_id: warehouseId,
          payload: event,
        });

        return this.stockMovementRepository.createMany(movements);
      },
    });
  }

  private buildPayloadSummary(
    event: PurchasingInvoiceConfirmedEventPayloadContract,
  ): Record<string, unknown> {
    return {
      tenant_id: event.tenant_id,
      invoice_id: event.invoice_id,
      item_count: event.items.length,
    };
  }
}
