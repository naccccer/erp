import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  SALES_INVOICE_CANCELLED_EVENT,
  SALES_INVOICE_CONFIRMED_EVENT,
  type SalesInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/sales.events.ts';
import type { StockMovement } from '../entities/stock-movement.entity.ts';
import type { IStockMovementRepository } from '../infra/stock-movement.repository.ts';
import type { IWarehouseRepository } from '../infra/warehouse.repository.ts';
import {
  CreateSalesInvoiceStockOutMovementsUseCase,
} from '../use-cases/create-sales-invoice-stock-out-movements/use-case.ts';
import type { SalesInvoice } from '../../sales/entities/sales-invoice.entity';
import type { ISalesInvoiceRepository } from '../../sales/infra/sales-invoice.repository';
import { ConfirmSalesInvoiceUseCase } from '../../sales/use-cases/confirm-sales-invoice/use-case.ts';
import { CreateSalesInvoiceUseCase } from '../../sales/use-cases/create-sales-invoice/use-case.ts';
import { SalesInvoiceConfirmedInventoryEventHandler } from './sales-invoice-confirmed.handler.ts';

class InMemorySalesInvoiceRepository implements ISalesInvoiceRepository {
  private readonly invoices = new Map<string, SalesInvoice>();

  async create(invoice: SalesInvoice): Promise<SalesInvoice> {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  async update(invoice: SalesInvoice): Promise<SalesInvoice> {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  async findById(id: string): Promise<SalesInvoice | null> {
    return this.invoices.get(id) ?? null;
  }

  async listByTenant(tenantId: string): Promise<SalesInvoice[]> {
    return [...this.invoices.values()].filter((invoice) => invoice.tenant_id === tenantId);
  }
}

class InMemoryStockMovementRepository implements IStockMovementRepository {
  private readonly movements: StockMovement[] = [];

  async createMany(movements: StockMovement[]): Promise<StockMovement[]> {
    this.movements.push(...movements);
    return movements;
  }

  async findByReference(referenceId: string): Promise<StockMovement[]> {
    return this.movements.filter((movement) => movement.reference_id === referenceId);
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

test('reacts to sales.invoice.confirmed and creates OUT stock movements', async () => {
  const stockMovementRepository = new InMemoryStockMovementRepository();
  const handler = new SalesInvoiceConfirmedInventoryEventHandler(
    new CreateSalesInvoiceStockOutMovementsUseCase(),
    stockMovementRepository,
    warehouseRepository,
  );

  const event: SalesInvoiceConfirmedEventContract = {
    name: SALES_INVOICE_CONFIRMED_EVENT,
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
      ],
    },
  };

  const movements = await handler.execute({
    event,
    warehouse_id: 'warehouse-1',
  });

  assert.equal(movements.length, 1);
  assert.equal(movements[0].movement_type, 'OUT');
  assert.equal(movements[0].tenant_id, 'tenant-1');
  assert.equal(movements[0].warehouse_id, 'warehouse-1');
  assert.equal(movements[0].product_id, 'product-1');
  assert.equal(movements[0].quantity, 2);
  assert.equal(movements[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, 'invoice-1');
});

test('covers CreateSalesInvoice -> ConfirmSalesInvoice -> event bus -> inventory OUT movement persistence', async () => {
  const salesRepository = new InMemorySalesInvoiceRepository();
  const stockMovementRepository = new InMemoryStockMovementRepository();
  const eventEmitter = new EventEmitter2();
  const inventoryHandler = new SalesInvoiceConfirmedInventoryEventHandler(
    new CreateSalesInvoiceStockOutMovementsUseCase(),
    stockMovementRepository,
    warehouseRepository,
  );

  eventEmitter.on(SALES_INVOICE_CONFIRMED_EVENT, (payload) => inventoryHandler.handle(payload));

  const createSalesInvoice = new CreateSalesInvoiceUseCase(salesRepository);
  const confirmSalesInvoice = new ConfirmSalesInvoiceUseCase(salesRepository, eventEmitter);

  const draftInvoice = await createSalesInvoice.execute({
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-06T08:00:00.000Z'),
    items: [
      {
        product_id: 'product-1',
        quantity: 2,
        unit_price: 100,
        discount: 10,
      },
      {
        product_id: 'product-2',
        quantity: 1,
        unit_price: 50,
      },
    ],
  });

  const confirmed = await confirmSalesInvoice.execute({ invoice: draftInvoice });
  const persistedMovements = await stockMovementRepository.findByReference(confirmed.invoice.id);

  assert.equal(confirmed.invoice.status, 'Confirmed');
  assert.equal(confirmed.events[0].name, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(persistedMovements.length, 2);
  assert.equal(persistedMovements[0].movement_type, 'OUT');
  assert.equal(persistedMovements[1].movement_type, 'OUT');
  assert.equal(persistedMovements[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(persistedMovements[1].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(persistedMovements[0].reference_id, confirmed.invoice.id);
  assert.equal(persistedMovements[1].reference_id, confirmed.invoice.id);
});

test('throws for unsupported sales event name', async () => {
  const stockMovementRepository = new InMemoryStockMovementRepository();
  const handler = new SalesInvoiceConfirmedInventoryEventHandler(
    new CreateSalesInvoiceStockOutMovementsUseCase(),
    stockMovementRepository,
    warehouseRepository,
  );

  const unsupportedEvent = {
    name: SALES_INVOICE_CANCELLED_EVENT,
    payload: {
      tenant_id: 'tenant-1',
      invoice_id: 'invoice-1',
      customer_id: 'customer-1',
      invoice_date: new Date('2026-03-06T08:00:00.000Z'),
      total_amount: 240,
      items: [],
    },
  } as unknown as SalesInvoiceConfirmedEventContract;

  await assert.rejects(
    () =>
      handler.execute({
        event: unsupportedEvent,
        warehouse_id: 'warehouse-1',
      }),
    /Unsupported sales event for inventory handler\./,
  );
});
