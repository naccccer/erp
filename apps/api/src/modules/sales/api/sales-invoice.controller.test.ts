import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import type { SalesInvoice } from '../entities/sales-invoice.entity';
import type { ISalesInvoiceRepository } from '../infra/sales-invoice.repository';
import type { ConfirmSalesInvoiceUseCase } from '../use-cases/confirm-sales-invoice/use-case';
import type { CreateSalesInvoiceUseCase } from '../use-cases/create-sales-invoice/use-case';
import { SalesInvoiceController } from './sales-invoice.controller';

function makeInvoice(id: string): SalesInvoice {
  return {
    id,
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-09T08:00:00.000Z'),
    status: 'Draft',
    total_amount: 120,
    items: [],
  };
}

test('creates invoice through CreateSalesInvoiceUseCase', async () => {
  const createdInvoice = makeInvoice('invoice-created');
  const createUseCase = {
    execute: async () => createdInvoice,
  } as unknown as CreateSalesInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: { ...createdInvoice, status: 'Confirmed' as const },
      events: [],
    }),
  } as unknown as ConfirmSalesInvoiceUseCase;
  const repository: ISalesInvoiceRepository = {
    create: async (invoice) => invoice,
    update: async (invoice) => invoice,
    findById: async (_id, _tenantId) => null,
    listByTenant: async () => [],
  };
  const controller = new SalesInvoiceController(createUseCase, confirmUseCase, repository);

  const result = await controller.create({
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-09T08:00:00.000Z'),
    items: [],
  });

  assert.equal(result.id, 'invoice-created');
});

test('confirms invoice through ConfirmSalesInvoiceUseCase', async () => {
  const invoice = makeInvoice('invoice-1');
  const createUseCase = {
    execute: async () => invoice,
  } as unknown as CreateSalesInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: { ...invoice, status: 'Confirmed' as const },
      events: [],
    }),
  } as unknown as ConfirmSalesInvoiceUseCase;
  const repository: ISalesInvoiceRepository = {
    create: async (saved) => saved,
    update: async (saved) => saved,
    findById: async (_id, _tenantId) => null,
    listByTenant: async () => [],
  };
  const controller = new SalesInvoiceController(createUseCase, confirmUseCase, repository);

  const result = await controller.confirm('invoice-1', {
    invoice,
  });

  assert.equal(result.invoice.status, 'Confirmed');
});

test('throws when confirm path id does not match invoice id', async () => {
  const createUseCase = {
    execute: async () => makeInvoice('invoice-created'),
  } as unknown as CreateSalesInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: makeInvoice('invoice-1'),
      events: [],
    }),
  } as unknown as ConfirmSalesInvoiceUseCase;
  const repository: ISalesInvoiceRepository = {
    create: async (saved) => saved,
    update: async (saved) => saved,
    findById: async (_id, _tenantId) => null,
    listByTenant: async () => [],
  };
  const controller = new SalesInvoiceController(createUseCase, confirmUseCase, repository);

  await assert.rejects(
    () =>
      controller.confirm('invoice-2', {
        invoice: makeInvoice('invoice-1'),
      }),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'Path id must match body.invoice.id.',
  );
});

test('lists invoices by tenant context', async () => {
  const createUseCase = {
    execute: async () => makeInvoice('invoice-created'),
  } as unknown as CreateSalesInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: makeInvoice('invoice-1'),
      events: [],
    }),
  } as unknown as ConfirmSalesInvoiceUseCase;
  const repository: ISalesInvoiceRepository = {
    create: async (saved) => saved,
    update: async (saved) => saved,
    findById: async (_id, _tenantId) => null,
    listByTenant: async () => [makeInvoice('invoice-1')],
  };
  const controller = new SalesInvoiceController(createUseCase, confirmUseCase, repository);

  const result = await controller.list({
    tenant_context: {
      user_id: 'user-1',
      tenant_id: 'tenant-1',
      role: 'sales',
      permission_keys: ['sales.invoice.read'],
    },
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'invoice-1');
});

test('throws when tenant context is missing', async () => {
  const createUseCase = {
    execute: async () => makeInvoice('invoice-created'),
  } as unknown as CreateSalesInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: makeInvoice('invoice-1'),
      events: [],
    }),
  } as unknown as ConfirmSalesInvoiceUseCase;
  const repository: ISalesInvoiceRepository = {
    create: async (saved) => saved,
    update: async (saved) => saved,
    findById: async (_id, _tenantId) => null,
    listByTenant: async () => [],
  };
  const controller = new SalesInvoiceController(createUseCase, confirmUseCase, repository);

  await assert.rejects(
    () => controller.list({}),
    (error: unknown) =>
      error instanceof ForbiddenException
      && error.message === 'Request header "x-tenant-id" is required.',
  );
});
