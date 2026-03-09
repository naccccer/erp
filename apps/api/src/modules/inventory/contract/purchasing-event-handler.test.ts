import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PURCHASING_INVOICE_CONFIRMED_EVENT,
  type PurchasingInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/purchasing.events.ts';
import type { StockMovement } from '../entities/stock-movement.entity.ts';
import type { IStockMovementRepository } from '../infra/stock-movement.repository.ts';
import type { IWarehouseRepository } from '../infra/warehouse.repository.ts';
import {
  CreatePurchaseInvoiceStockInMovementsUseCase,
} from '../use-cases/create-purchase-invoice-stock-in-movements/use-case.ts';
import { PurchasingInvoiceConfirmedInventoryEventHandler } from './purchasing-invoice-confirmed.handler.ts';

class InMemoryStockMovementRepository implements IStockMovementRepository {
  private readonly movements: StockMovement[] = [];

  async createMany(movements: StockMovement[]): Promise<StockMovement[]> {
    this.movements.push(...movements);
    return movements;
  }

  async findByReference(referenceId: string): Promise<StockMovement[]> {
    return this.movements.filter((movement) => movement.reference_id === referenceId);
  }

  async getAvailableStock(_warehouseId: string, _productId: string): Promise<number> {
    return 0;
  }
}

const warehouseRepository: IWarehouseRepository = {
  findDefaultByTenantId: async (tenantId: string) => ({
    id: `warehouse-${tenantId}`,
    tenant_id: tenantId,
    code: 'MAIN',
    name: 'Main Warehouse',
    is_active: true,
  }),
};

test('reacts to purchasing.invoice.confirmed and creates IN stock movements', async () => {
  const stockMovementRepository = new InMemoryStockMovementRepository();
  const handler = new PurchasingInvoiceConfirmedInventoryEventHandler(
    new CreatePurchaseInvoiceStockInMovementsUseCase(),
    stockMovementRepository,
    warehouseRepository,
  );

  const event: PurchasingInvoiceConfirmedEventContract = {
    name: PURCHASING_INVOICE_CONFIRMED_EVENT,
    payload: {
      tenant_id: 'tenant-1',
      invoice_id: 'purchase-1',
      supplier_id: 'supplier-1',
      invoice_date: new Date('2026-03-07T08:00:00.000Z'),
      total_amount: 90,
      items: [
        {
          product_id: 'product-1',
          quantity: 3,
          unit_cost: 20,
          line_total: 60,
        },
      ],
    },
  };

  const movements = await handler.execute({
    event,
    warehouse_id: 'warehouse-1',
  });
  const duplicateDeliveryMovements = await handler.execute({
    event,
    warehouse_id: 'warehouse-1',
  });
  const persistedMovements = await stockMovementRepository.findByReference('purchase-1');

  assert.equal(movements.length, 1);
  assert.equal(duplicateDeliveryMovements.length, 1);
  assert.equal(persistedMovements.length, 1);
  assert.equal(movements[0].movement_type, 'IN');
  assert.equal(movements[0].tenant_id, 'tenant-1');
  assert.equal(movements[0].warehouse_id, 'warehouse-1');
  assert.equal(movements[0].product_id, 'product-1');
  assert.equal(movements[0].quantity, 3);
  assert.equal(movements[0].reference_type, PURCHASING_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, 'purchase-1');
});
