import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { FINANCE_PERMISSIONS } from '../../../../../packages/contracts/src/permissions/finance.permissions.ts';
import { SALES_PERMISSIONS } from '../../../../../packages/contracts/src/permissions/sales.permissions.ts';
import { RequirePermission } from './require-permission.decorator.ts';
import type { RequestWithTenantContext } from './request-context.ts';
import { TenantPermissionGuard } from './tenant-permission.guard.ts';

class GuardFixture {
  @RequirePermission(SALES_PERMISSIONS.INVOICE_READ)
  readSalesInvoice(): void {}

  @RequirePermission(FINANCE_PERMISSIONS.PAYMENT_CREATE)
  createPayment(): void {}
}

function buildExecutionContext(
  handler: (...args: unknown[]) => unknown,
  request: RequestWithTenantContext,
): ExecutionContext {
  return {
    getClass: () => GuardFixture,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

test('allows request when required permission is granted through role mapping', () => {
  const guard = new TenantPermissionGuard(new Reflector());
  const fixture = new GuardFixture();
  const request: RequestWithTenantContext = {
    headers: {
      'x-tenant-id': 'tenant-1',
      'x-role': 'sales',
    },
  };
  const executionContext = buildExecutionContext(fixture.readSalesInvoice, request);

  const allowed = guard.canActivate(executionContext);

  assert.equal(allowed, true);
  assert.equal(request.tenant_context?.tenant_id, 'tenant-1');
  assert.equal(request.tenant_context?.role, 'sales');
});

test('rejects request when role does not include required permission', () => {
  const guard = new TenantPermissionGuard(new Reflector());
  const fixture = new GuardFixture();
  const request: RequestWithTenantContext = {
    headers: {
      'x-tenant-id': 'tenant-1',
      'x-role': 'viewer',
    },
  };
  const executionContext = buildExecutionContext(fixture.createPayment, request);

  assert.throws(
    () => guard.canActivate(executionContext),
    /Permission "finance.payment.create" is required\./,
  );
});

test('rejects request when tenant header is missing', () => {
  const guard = new TenantPermissionGuard(new Reflector());
  const fixture = new GuardFixture();
  const request: RequestWithTenantContext = {
    headers: {
      'x-role': 'sales',
    },
  };
  const executionContext = buildExecutionContext(fixture.readSalesInvoice, request);

  assert.throws(
    () => guard.canActivate(executionContext),
    /Request header "x-tenant-id" is required\./,
  );
});
