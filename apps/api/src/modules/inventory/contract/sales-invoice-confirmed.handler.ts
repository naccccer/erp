import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  SALES_INVOICE_CONFIRMED_EVENT,
  type SalesInvoiceConfirmedEventContract,
  type SalesInvoiceConfirmedEventPayloadContract,
} from '../../../../../../packages/contracts/src/events/sales.events.ts';
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
  CreateSalesInvoiceStockOutMovementsUseCase,
} from '../use-cases/create-sales-invoice-stock-out-movements/use-case.ts';
import {
  assertSupportedEventName,
  defineDomainEventHandlerRegistration,
  withStockMovementIdempotencyGuard,
} from './event-handler.pattern.ts';

export interface SalesInvoiceConfirmedInventoryEventHandlerDto {
  event: SalesInvoiceConfirmedEventContract;
  warehouse_id: string;
}

export const SALES_INVOICE_CONFIRMED_HANDLER_REGISTRATION =
  defineDomainEventHandlerRegistration(SALES_INVOICE_CONFIRMED_EVENT);

@Injectable()
export class SalesInvoiceConfirmedInventoryEventHandler {
  private readonly logger = new Logger(SalesInvoiceConfirmedInventoryEventHandler.name);

  constructor(
    private readonly useCase: CreateSalesInvoiceStockOutMovementsUseCase,
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  async execute(input: SalesInvoiceConfirmedInventoryEventHandlerDto): Promise<StockMovement[]> {
    assertSupportedEventName(
      SALES_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
      input.event.name,
      'Unsupported sales event for inventory handler.',
    );

    return this.createAndPersistMovements(input.event.payload, input.warehouse_id);
  }

  @OnEvent(SALES_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName)
  async handle(event: SalesInvoiceConfirmedEventPayloadContract): Promise<StockMovement[]> {
    const payloadSummary = this.buildPayloadSummary(event);

    try {
      const warehouse = await this.warehouseRepository.findDefaultByTenantId(event.tenant_id);

      if (!warehouse) {
        throw new Error(
          `No active warehouse found for tenant "${event.tenant_id}" while handling sales.invoice.confirmed.`,
        );
      }

      const movements = await this.createAndPersistMovements(event, warehouse.id);

      this.logger.log(
        JSON.stringify({
          event_name: SALES_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
          payload_summary: payloadSummary,
          handler_name: SalesInvoiceConfirmedInventoryEventHandler.name,
          handler_outcome: 'success',
          movement_count: movements.length,
        }),
      );

      return movements;
    } catch (error: unknown) {
      this.logger.error(
        JSON.stringify({
          event_name: SALES_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
          payload_summary: payloadSummary,
          handler_name: SalesInvoiceConfirmedInventoryEventHandler.name,
          handler_outcome: 'failure',
          error_message: error instanceof Error ? error.message : String(error),
        }),
      );

      return [];
    }
  }

  private async createAndPersistMovements(
    event: SalesInvoiceConfirmedEventPayloadContract,
    warehouseId: string,
  ): Promise<StockMovement[]> {
    return withStockMovementIdempotencyGuard({
      eventName: SALES_INVOICE_CONFIRMED_HANDLER_REGISTRATION.eventName,
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
    event: SalesInvoiceConfirmedEventPayloadContract,
  ): Record<string, unknown> {
    return {
      tenant_id: event.tenant_id,
      invoice_id: event.invoice_id,
      item_count: event.items.length,
    };
  }
}
