import { PrismaPg } from '@prisma/adapter-pg';
import { InvoiceStatus, MovementType, PrismaClient } from '@prisma/client';

import { buildDemoDataset, DEMO_TENANT_ID } from './demo-dataset.ts';

function resolveDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  return databaseUrl;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() }),
  });
}

async function resetTenantData(prisma: PrismaClient, tenantId: string): Promise<void> {
  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.stockMovement.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.salesInvoiceItem.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.purchaseInvoiceItem.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.salesInvoice.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.purchaseInvoice.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.customer.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.supplier.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.product.deleteMany({ where: { tenant_id: tenantId } }),
    prisma.warehouse.deleteMany({ where: { tenant_id: tenantId } }),
  ]);
}

async function seedDemoData(prisma: PrismaClient): Promise<void> {
  const dataset = buildDemoDataset();

  for (const warehouse of dataset.warehouses) {
    await prisma.warehouse.upsert({
      where: { id: warehouse.id },
      update: {
        tenant_id: warehouse.tenant_id,
        code: warehouse.code,
        name: warehouse.name,
        is_active: warehouse.is_active,
      },
      create: warehouse,
    });
  }

  for (const product of dataset.products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        tenant_id: product.tenant_id,
        name: product.name,
        sku: product.sku,
      },
      create: product,
    });
  }

  for (const customer of dataset.customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        tenant_id: customer.tenant_id,
        display_name: customer.display_name,
      },
      create: customer,
    });
  }

  for (const supplier of dataset.suppliers) {
    await prisma.supplier.upsert({
      where: { id: supplier.id },
      update: {
        tenant_id: supplier.tenant_id,
        display_name: supplier.display_name,
      },
      create: supplier,
    });
  }

  for (const invoice of dataset.purchase_invoices) {
    await prisma.purchaseInvoice.upsert({
      where: { id: invoice.id },
      update: {
        tenant_id: invoice.tenant_id,
        supplier_id: invoice.supplier_id,
        invoice_date: invoice.invoice_date,
        status: invoice.status as InvoiceStatus,
        total_amount: invoice.total_amount,
      },
      create: {
        id: invoice.id,
        tenant_id: invoice.tenant_id,
        supplier_id: invoice.supplier_id,
        invoice_date: invoice.invoice_date,
        status: invoice.status as InvoiceStatus,
        total_amount: invoice.total_amount,
      },
    });

    await prisma.purchaseInvoiceItem.deleteMany({
      where: {
        tenant_id: invoice.tenant_id,
        invoice_id: invoice.id,
      },
    });

    await prisma.purchaseInvoiceItem.createMany({
      data: invoice.items,
    });
  }

  for (const invoice of dataset.sales_invoices) {
    await prisma.salesInvoice.upsert({
      where: { id: invoice.id },
      update: {
        tenant_id: invoice.tenant_id,
        customer_id: invoice.customer_id,
        invoice_date: invoice.invoice_date,
        status: invoice.status as InvoiceStatus,
        total_amount: invoice.total_amount,
      },
      create: {
        id: invoice.id,
        tenant_id: invoice.tenant_id,
        customer_id: invoice.customer_id,
        invoice_date: invoice.invoice_date,
        status: invoice.status as InvoiceStatus,
        total_amount: invoice.total_amount,
      },
    });

    await prisma.salesInvoiceItem.deleteMany({
      where: {
        tenant_id: invoice.tenant_id,
        invoice_id: invoice.id,
      },
    });

    await prisma.salesInvoiceItem.createMany({
      data: invoice.items,
    });
  }

  for (const movement of dataset.stock_movements) {
    await prisma.stockMovement.upsert({
      where: { id: movement.id },
      update: {
        tenant_id: movement.tenant_id,
        warehouse_id: movement.warehouse_id,
        product_id: movement.product_id,
        movement_type: movement.movement_type as MovementType,
        quantity: movement.quantity,
        occurred_at: movement.occurred_at,
        reference_type: movement.reference_type,
        reference_id: movement.reference_id,
      },
      create: {
        id: movement.id,
        tenant_id: movement.tenant_id,
        warehouse_id: movement.warehouse_id,
        product_id: movement.product_id,
        movement_type: movement.movement_type as MovementType,
        quantity: movement.quantity,
        occurred_at: movement.occurred_at,
        reference_type: movement.reference_type,
        reference_id: movement.reference_id,
      },
    });
  }

  for (const payment of dataset.payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: {
        tenant_id: payment.tenant_id,
        reference_type: payment.reference_type,
        reference_id: payment.reference_id,
        amount: payment.amount,
        paid_at: payment.paid_at,
        status: payment.status,
      },
      create: payment,
    });
  }

  console.log(
    `[seed:demo] tenant=${DEMO_TENANT_ID} warehouses=${dataset.warehouses.length} products=${dataset.products.length} contacts=${dataset.customers.length + dataset.suppliers.length} sales_invoices=${dataset.sales_invoices.length} purchase_invoices=${dataset.purchase_invoices.length} stock_movements=${dataset.stock_movements.length} payments=${dataset.payments.length}`,
  );
}

async function main(): Promise<void> {
  const shouldReset = process.argv.includes('--reset');
  const prisma = createPrismaClient();

  try {
    if (shouldReset) {
      await resetTenantData(prisma, DEMO_TENANT_ID);
      console.log(`[seed:demo] tenant reset completed for ${DEMO_TENANT_ID}`);
    }

    await seedDemoData(prisma);
    console.log('[seed:demo] deterministic reseed completed');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('[seed:demo] failed', error);
  process.exitCode = 1;
});
