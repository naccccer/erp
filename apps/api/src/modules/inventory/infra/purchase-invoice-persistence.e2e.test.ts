import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';

import { PURCHASING_INVOICE_CONFIRMED_EVENT } from '../../../../../../packages/contracts/src/events/purchasing.events.ts';
import { AppModule } from '../../../app.module.ts';
import { ConfirmPurchaseInvoiceUseCase } from '../../purchasing/use-cases/confirm-purchase-invoice/use-case.ts';
import { CreatePurchaseInvoiceUseCase } from '../../purchasing/use-cases/create-purchase-invoice/use-case.ts';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

test(
  'persists purchase invoice confirmation and creates stock movement through event bus',
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

      const createPurchaseInvoice = app.get(CreatePurchaseInvoiceUseCase);
      const confirmPurchaseInvoice = app.get(ConfirmPurchaseInvoiceUseCase);

      const draftInvoice = await createPurchaseInvoice.execute({
        tenant_id: tenantId,
        supplier_id: 'supplier-e2e',
        invoice_date: new Date('2026-03-10T08:00:00.000Z'),
        items: [
          {
            product_id: 'product-e2e-1',
            quantity: 3,
            unit_cost: 50,
          },
        ],
      });

      const confirmedResult = await confirmPurchaseInvoice.execute({ invoice: draftInvoice });

      const persistedInvoice = await prisma.purchaseInvoice.findFirst({
        where: {
          id: confirmedResult.invoice.id,
          tenant_id: tenantId,
        },
      });
      const movementRows = await prisma.stockMovement.findMany({
        where: {
          tenant_id: tenantId,
          reference_id: confirmedResult.invoice.id,
        },
      });

      assert.equal(confirmedResult.invoice.status, 'Confirmed');
      assert.equal(confirmedResult.events[0].name, PURCHASING_INVOICE_CONFIRMED_EVENT);
      assert.equal(persistedInvoice?.status, 'Confirmed');
      assert.equal(movementRows.length, 1);
      assert.equal(movementRows[0].warehouse_id, warehouseId);
      assert.equal(movementRows[0].movement_type, 'IN');
      assert.equal(movementRows[0].reference_type, PURCHASING_INVOICE_CONFIRMED_EVENT);
    } finally {
      await prisma.stockMovement.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.purchaseInvoiceItem.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.purchaseInvoice.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.warehouse.deleteMany({ where: { tenant_id: tenantId } });
      await app.close();
      await prisma.$disconnect();
    }
  },
);
