import { Injectable } from '@nestjs/common';

import {
  PURCHASING_INVOICE_CONFIRMED_EVENT,
  type PurchasingInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/purchasing.events.ts';
import type { StockMovement } from '../entities/stock-movement.entity.ts';
import {
  CreatePurchaseInvoiceStockInMovementsUseCase,
} from '../use-cases/create-purchase-invoice-stock-in-movements/use-case.ts';

export interface PurchasingInvoiceConfirmedInventoryEventHandlerDto {
  event: PurchasingInvoiceConfirmedEventContract;
  warehouse_id: string;
}

@Injectable()
export class PurchasingInvoiceConfirmedInventoryEventHandler {
  private readonly useCase: CreatePurchaseInvoiceStockInMovementsUseCase;

  constructor(useCase?: CreatePurchaseInvoiceStockInMovementsUseCase) {
    this.useCase = useCase ?? new CreatePurchaseInvoiceStockInMovementsUseCase();
  }

  execute(input: PurchasingInvoiceConfirmedInventoryEventHandlerDto): StockMovement[] {
    if (input.event.name !== PURCHASING_INVOICE_CONFIRMED_EVENT) {
      throw new Error('Unsupported purchasing event for inventory handler.');
    }

    return this.useCase.execute({
      warehouse_id: input.warehouse_id,
      payload: input.event.payload,
    });
  }
}
