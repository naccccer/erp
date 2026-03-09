import { ForbiddenException } from '@nestjs/common';

import type { AuthSessionContract } from '../../modules/auth/contract/auth.contract';
import { FINANCE_PERMISSIONS } from '../../../../../packages/contracts/src/permissions/finance.permissions.ts';
import { INVENTORY_PERMISSIONS } from '../../../../../packages/contracts/src/permissions/inventory.permissions.ts';
import { PURCHASING_PERMISSIONS } from '../../../../../packages/contracts/src/permissions/purchasing.permissions.ts';
import { SALES_PERMISSIONS } from '../../../../../packages/contracts/src/permissions/sales.permissions.ts';

const ALL_PERMISSION_KEYS = [
  ...Object.values(SALES_PERMISSIONS),
  ...Object.values(PURCHASING_PERMISSIONS),
  ...Object.values(INVENTORY_PERMISSIONS),
  ...Object.values(FINANCE_PERMISSIONS),
];

const ROLE_PERMISSION_KEYS: Record<string, string[]> = {
  admin: ['*'],
  owner: ['*'],
  manager: ALL_PERMISSION_KEYS,
  sales: [
    SALES_PERMISSIONS.INVOICE_CREATE,
    SALES_PERMISSIONS.INVOICE_CONFIRM,
    SALES_PERMISSIONS.INVOICE_READ,
  ],
  purchasing: [
    PURCHASING_PERMISSIONS.INVOICE_CREATE,
    PURCHASING_PERMISSIONS.INVOICE_CONFIRM,
    PURCHASING_PERMISSIONS.INVOICE_READ,
  ],
  inventory: [
    INVENTORY_PERMISSIONS.MOVEMENT_READ,
  ],
  finance: [
    FINANCE_PERMISSIONS.PAYMENT_CREATE,
  ],
  viewer: [
    SALES_PERMISSIONS.INVOICE_READ,
    PURCHASING_PERMISSIONS.INVOICE_READ,
    INVENTORY_PERMISSIONS.MOVEMENT_READ,
  ],
};

type HeaderValue = string | string[] | undefined;

export interface RequestWithTenantContext {
  headers?: Record<string, HeaderValue>;
  tenant_context?: TenantRequestContext;
}

export interface TenantRequestContext extends AuthSessionContract {
  role: string;
}

function readHeaderValue(
  headers: Record<string, HeaderValue> | undefined,
  key: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }

  const exact = headers[key];
  if (typeof exact === 'string') {
    return exact;
  }
  if (Array.isArray(exact)) {
    return exact[0];
  }

  const normalizedKey = key.toLowerCase();

  for (const [headerName, value] of Object.entries(headers)) {
    if (headerName.toLowerCase() !== normalizedKey) {
      continue;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value[0];
    }
  }

  return undefined;
}

function parsePermissionKeys(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((permission) => permission.trim())
    .filter((permission) => permission.length > 0);
}

export function resolveTenantRequestContext(request: RequestWithTenantContext): TenantRequestContext {
  if (request.tenant_context) {
    return request.tenant_context;
  }

  const tenantId = readHeaderValue(request.headers, 'x-tenant-id');
  const role = readHeaderValue(request.headers, 'x-role');

  if (!tenantId) {
    throw new ForbiddenException('Request header "x-tenant-id" is required.');
  }

  if (!role) {
    throw new ForbiddenException('Request header "x-role" is required.');
  }

  const explicitPermissionKeys = parsePermissionKeys(
    readHeaderValue(request.headers, 'x-permissions'),
  );
  const permissionKeys = explicitPermissionKeys.length > 0
    ? explicitPermissionKeys
    : (ROLE_PERMISSION_KEYS[role] ?? []);

  const tenantContext: TenantRequestContext = {
    user_id: readHeaderValue(request.headers, 'x-user-id') ?? 'stub-user',
    tenant_id: tenantId,
    role,
    permission_keys: permissionKeys,
  };

  request.tenant_context = tenantContext;

  return tenantContext;
}
