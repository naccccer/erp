import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';

import type { IStockMovementRepository } from '../infra/stock-movement.repository.ts';
import { InventoryMovementsController } from './inventory-movements.controller.ts';

test('returns stock movements by invoiceId', async () => {
  const repository: IStockMovementRepository = {
    createMany: async (movements) => movements,
    findByReference: async (_tenantId, _referenceId) => [
      {
        id: 'move-1',
        tenant_id: 'tenant-1',
        warehouse_id: 'warehouse-1',
        product_id: 'product-1',
        movement_type: 'OUT',
        quantity: 2,
        occurred_at: new Date('2026-03-09T08:00:00.000Z'),
        reference_type: 'sales.invoice.confirmed',
        reference_id: 'invoice-1',
      },
    ],
    getAvailableStock: async (_tenantId, _warehouseId, _productId) => 0,
  };

  const controller = new InventoryMovementsController(repository);
  const result = await controller.list('invoice-1', {
    tenant_context: {
      user_id: 'user-1',
      tenant_id: 'tenant-1',
      role: 'inventory',
      permission_keys: ['inventory.movement.read'],
    },
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].reference_id, 'invoice-1');
});

test('throws when invoiceId query is missing', async () => {
  const repository: IStockMovementRepository = {
    createMany: async (movements) => movements,
    findByReference: async (_tenantId, _referenceId) => [],
    getAvailableStock: async (_tenantId, _warehouseId, _productId) => 0,
  };

  const controller = new InventoryMovementsController(repository);

  await assert.rejects(
    () =>
      controller.list('', {
        tenant_context: {
          user_id: 'user-1',
          tenant_id: 'tenant-1',
          role: 'inventory',
          permission_keys: ['inventory.movement.read'],
        },
      }),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'Query parameter "invoiceId" is required.',
  );
});
