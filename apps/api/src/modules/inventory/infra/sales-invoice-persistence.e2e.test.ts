import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../packages/contracts/src/events/sales.events.ts';
import { AppModule } from '../../../app.module';
import { ConfirmSalesInvoiceUseCase } from '../../sales/use-cases/confirm-sales-invoice/use-case.ts';
import { CreateSalesInvoiceUseCase } from '../../sales/use-cases/create-sales-invoice/use-case.ts';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

test(
  'persists sales invoice confirmation and creates stock movement through event bus',
  { skip: !hasDatabaseUrl },
  async () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
    });
    const tenantId = `tenant-e2e-${randomUUID()}`;
    const warehouseId = `warehouse-e2e-${randomUUID()}`;
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    try {
      await prisma.$connect();

      await prisma.warehouse.create({
        data: {
          id: warehouseId,
          tenant_id: tenantId,
          code: 'MAIN',
          name: 'Main Warehouse',
          is_active: true,
        },
      });
      await prisma.stockMovement.create({
        data: {
          id: `seed-in-${randomUUID()}`,
          tenant_id: tenantId,
          warehouse_id: warehouseId,
          product_id: 'product-e2e-1',
          movement_type: 'IN',
          quantity: 10,
          occurred_at: new Date('2026-03-08T09:00:00.000Z'),
          reference_type: 'inventory.seed',
          reference_id: `seed-${tenantId}`,
        },
      });

      const createSalesInvoice = app.get(CreateSalesInvoiceUseCase);
      const confirmSalesInvoice = app.get(ConfirmSalesInvoiceUseCase);

      const draftInvoice = await createSalesInvoice.execute({
        tenant_id: tenantId,
        customer_id: 'customer-e2e',
        invoice_date: new Date('2026-03-08T10:00:00.000Z'),
        items: [
          {
            product_id: 'product-e2e-1',
            quantity: 2,
            unit_price: 100,
            discount: 10,
          },
        ],
      });

      const confirmedResult = await confirmSalesInvoice.execute({ invoice: draftInvoice });

      const movementRows = await prisma.stockMovement.findMany({
        where: {
          reference_id: confirmedResult.invoice.id,
        },
      });

      assert.equal(confirmedResult.invoice.status, 'Confirmed');
      assert.equal(confirmedResult.events[0].name, SALES_INVOICE_CONFIRMED_EVENT);
      assert.equal(movementRows.length, 1);
      assert.equal(movementRows[0].tenant_id, tenantId);
      assert.equal(movementRows[0].warehouse_id, warehouseId);
      assert.equal(movementRows[0].movement_type, 'OUT');
      assert.equal(movementRows[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
    } finally {
      await prisma.stockMovement.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.salesInvoiceItem.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.salesInvoice.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.warehouse.deleteMany({ where: { tenant_id: tenantId } });
      await app.close();
      await prisma.$disconnect();
    }
  },
);
