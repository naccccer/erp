export const INVENTORY_PERMISSIONS = {
  MOVEMENT_READ: 'inventory.movement.read',
} as const;

export type InventoryPermissionKey =
  (typeof INVENTORY_PERMISSIONS)[keyof typeof INVENTORY_PERMISSIONS];
