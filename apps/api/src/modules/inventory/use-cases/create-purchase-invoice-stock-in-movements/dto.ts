import type { PurchasingInvoiceConfirmedEventPayloadContract } from '../../../../../../../packages/contracts/src/events/purchasing.events.ts';

export interface CreatePurchaseInvoiceStockInMovementsDto {
  warehouse_id: string;
  payload: PurchasingInvoiceConfirmedEventPayloadContract;
}
