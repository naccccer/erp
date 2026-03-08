import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../../packages/contracts/src/events/sales.events.ts';
import type { StockMovement } from '../../entities/stock-movement.entity.ts';
import type { CreateSalesInvoiceStockOutMovementsDto } from './dto.ts';

@Injectable()
export class CreateSalesInvoiceStockOutMovementsUseCase {
  execute(input: CreateSalesInvoiceStockOutMovementsDto): StockMovement[] {
    return input.payload.items.map((item) => ({
      id: randomUUID(),
      tenant_id: input.payload.tenant_id,
      warehouse_id: input.warehouse_id,
      product_id: item.product_id,
      movement_type: 'OUT',
      quantity: item.quantity,
      occurred_at: input.payload.invoice_date,
      reference_type: SALES_INVOICE_CONFIRMED_EVENT,
      reference_id: input.payload.invoice_id,
    }));
  }
}
