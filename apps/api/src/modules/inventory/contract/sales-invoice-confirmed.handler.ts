import {
  SALES_INVOICE_CONFIRMED_EVENT,
  type SalesInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/sales.events.ts';
import type { StockMovement } from '../entities/stock-movement.entity.ts';
import {
  CreateSalesInvoiceStockOutMovementsUseCase,
} from '../use-cases/create-sales-invoice-stock-out-movements/use-case.ts';

export interface SalesInvoiceConfirmedInventoryEventHandlerDto {
  event: SalesInvoiceConfirmedEventContract;
  warehouse_id: string;
}

export class SalesInvoiceConfirmedInventoryEventHandler {
  private readonly useCase: CreateSalesInvoiceStockOutMovementsUseCase;

  constructor(useCase?: CreateSalesInvoiceStockOutMovementsUseCase) {
    this.useCase = useCase ?? new CreateSalesInvoiceStockOutMovementsUseCase();
  }

  execute(input: SalesInvoiceConfirmedInventoryEventHandlerDto): StockMovement[] {
    if (input.event.name !== SALES_INVOICE_CONFIRMED_EVENT) {
      throw new Error('Unsupported sales event for inventory handler.');
    }

    return this.useCase.execute({
      warehouse_id: input.warehouse_id,
      payload: input.event.payload,
    });
  }
}
