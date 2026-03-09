import assert from 'node:assert/strict';
import test from 'node:test';

import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../../packages/contracts/src/events/sales.events.ts';
import type { IStockMovementRepository } from '../../infra/stock-movement.repository.ts';
import { InsufficientStockError } from './insufficient-stock.error.ts';
import { CreateSalesInvoiceStockOutMovementsUseCase } from './use-case.ts';

function createStockMovementRepository(
  stockByProduct: Record<string, number>,
): IStockMovementRepository {
  return {
    createMany: async (movements) => movements,
    findByReference: async () => [],
    getAvailableStock: async (_warehouseId, productId) => stockByProduct[productId] ?? 0,
  };
}

test('rejects OUT stock movements when available stock is insufficient', async () => {
  const useCase = new CreateSalesInvoiceStockOutMovementsUseCase(
    createStockMovementRepository({ 'product-1': 3 }),
  );

  await assert.rejects(
    () =>
      useCase.execute({
        warehouse_id: 'warehouse-1',
        payload: {
          tenant_id: 'tenant-1',
          invoice_id: 'invoice-1',
          customer_id: 'customer-1',
          invoice_date: new Date('2026-03-06T08:00:00.000Z'),
          total_amount: 200,
          items: [
            {
              product_id: 'product-1',
              quantity: 2,
              unit_price: 50,
              discount: 0,
              line_total: 100,
            },
            {
              product_id: 'product-1',
              quantity: 2,
              unit_price: 50,
              discount: 0,
              line_total: 100,
            },
          ],
        },
      }),
    (error: unknown) =>
      error instanceof InsufficientStockError
      && error.productId === 'product-1'
      && error.requestedQuantity === 2
      && error.availableQuantity === 1,
  );
});

test('creates OUT stock movements from confirmed sales invoice payload when stock is available', async () => {
  const useCase = new CreateSalesInvoiceStockOutMovementsUseCase(
    createStockMovementRepository({ 'product-1': 3, 'product-2': 1 }),
  );

  const movements = await useCase.execute({
    warehouse_id: 'warehouse-1',
    payload: {
      tenant_id: 'tenant-1',
      invoice_id: 'invoice-1',
      customer_id: 'customer-1',
      invoice_date: new Date('2026-03-06T08:00:00.000Z'),
      total_amount: 240,
      items: [
        {
          product_id: 'product-1',
          quantity: 2,
          unit_price: 100,
          discount: 10,
          line_total: 190,
        },
        {
          product_id: 'product-2',
          quantity: 1,
          unit_price: 50,
          discount: 0,
          line_total: 50,
        },
      ],
    },
  });

  assert.equal(movements.length, 2);
  assert.equal(movements[0].movement_type, 'OUT');
  assert.equal(movements[0].tenant_id, 'tenant-1');
  assert.equal(movements[0].warehouse_id, 'warehouse-1');
  assert.equal(movements[0].product_id, 'product-1');
  assert.equal(movements[0].quantity, 2);
  assert.equal(movements[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, 'invoice-1');
  assert.equal(
    movements[0].occurred_at.toISOString(),
    '2026-03-06T08:00:00.000Z',
  );

  assert.equal(movements[1].movement_type, 'OUT');
  assert.equal(movements[1].product_id, 'product-2');
  assert.equal(movements[1].quantity, 1);
  assert.ok(movements[0].id.length > 0);
  assert.ok(movements[1].id.length > 0);
});
