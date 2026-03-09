import { SetMetadata } from '@nestjs/common';

import type { FinancePermissionKey } from '../../../../../packages/contracts/src/permissions/finance.permissions.ts';
import type { InventoryPermissionKey } from '../../../../../packages/contracts/src/permissions/inventory.permissions.ts';
import type { PurchasingPermissionKey } from '../../../../../packages/contracts/src/permissions/purchasing.permissions.ts';
import type { SalesPermissionKey } from '../../../../../packages/contracts/src/permissions/sales.permissions.ts';

export type PermissionKey =
  | SalesPermissionKey
  | PurchasingPermissionKey
  | InventoryPermissionKey
  | FinancePermissionKey;

export const REQUIRED_PERMISSION_METADATA_KEY = 'required_permission';

export function RequirePermission(permission: PermissionKey) {
  return SetMetadata(REQUIRED_PERMISSION_METADATA_KEY, permission);
}
