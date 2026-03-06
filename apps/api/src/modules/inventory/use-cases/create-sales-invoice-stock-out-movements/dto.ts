import type { SalesInvoiceConfirmedEventPayloadContract } from '../../../../../../../packages/contracts/src/events/sales.events.ts';

export interface CreateSalesInvoiceStockOutMovementsDto {
  warehouse_id: string;
  payload: SalesInvoiceConfirmedEventPayloadContract;
}
