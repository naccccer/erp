import { randomUUID } from 'node:crypto';

import { PURCHASING_INVOICE_CONFIRMED_EVENT } from '../../../../../../../packages/contracts/src/events/purchasing.events.ts';
import type { StockMovement } from '../../entities/stock-movement.entity.ts';
import type { CreatePurchaseInvoiceStockInMovementsDto } from './dto.ts';

export class CreatePurchaseInvoiceStockInMovementsUseCase {
  execute(input: CreatePurchaseInvoiceStockInMovementsDto): StockMovement[] {
    return input.payload.items.map((item) => ({
      id: randomUUID(),
      tenant_id: input.payload.tenant_id,
      warehouse_id: input.warehouse_id,
      product_id: item.product_id,
      movement_type: 'IN',
      quantity: item.quantity,
      occurred_at: input.payload.invoice_date,
      reference_type: PURCHASING_INVOICE_CONFIRMED_EVENT,
      reference_id: input.payload.invoice_id,
    }));
  }
}
