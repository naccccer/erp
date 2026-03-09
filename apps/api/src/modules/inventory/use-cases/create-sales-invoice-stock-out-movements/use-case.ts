import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../../packages/contracts/src/events/sales.events.ts';
import type { StockMovement } from '../../entities/stock-movement.entity.ts';
import {
  STOCK_MOVEMENT_REPOSITORY,
  type IStockMovementRepository,
} from '../../infra/stock-movement.repository.ts';
import type { CreateSalesInvoiceStockOutMovementsDto } from './dto.ts';
import { InsufficientStockError } from './insufficient-stock.error.ts';

@Injectable()
export class CreateSalesInvoiceStockOutMovementsUseCase {
  constructor(
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(input: CreateSalesInvoiceStockOutMovementsDto): Promise<StockMovement[]> {
    const availableStockByProduct = new Map<string, number>();
    const movements: StockMovement[] = [];

    for (const item of input.payload.items) {
      const currentAvailableStock =
        availableStockByProduct.get(item.product_id) ??
        await this.stockMovementRepository.getAvailableStock(input.warehouse_id, item.product_id);

      if (item.quantity > currentAvailableStock) {
        throw new InsufficientStockError({
          warehouseId: input.warehouse_id,
          productId: item.product_id,
          requestedQuantity: item.quantity,
          availableQuantity: currentAvailableStock,
        });
      }

      availableStockByProduct.set(item.product_id, currentAvailableStock - item.quantity);

      movements.push({
        id: randomUUID(),
        tenant_id: input.payload.tenant_id,
        warehouse_id: input.warehouse_id,
        product_id: item.product_id,
        movement_type: 'OUT',
        quantity: item.quantity,
        occurred_at: input.payload.invoice_date,
        reference_type: SALES_INVOICE_CONFIRMED_EVENT,
        reference_id: input.payload.invoice_id,
      });
    }

    return movements;
  }
}
