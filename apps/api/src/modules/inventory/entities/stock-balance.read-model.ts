import type { StockMovement } from './stock-movement.entity.ts';

export interface StockBalance {
  tenant_id: string;
  warehouse_id: string;
  product_id: string;
  quantity_on_hand: number;
}

function toSignedQuantity(movement: StockMovement): number {
  const absoluteQuantity = Math.abs(movement.quantity);

  return movement.movement_type === 'IN' ? absoluteQuantity : -absoluteQuantity;
}

export function buildStockBalancesFromMovements(
  movements: StockMovement[],
): StockBalance[] {
  const balanceByKey = new Map<string, StockBalance>();

  for (const movement of movements) {
    const key = `${movement.tenant_id}:${movement.warehouse_id}:${movement.product_id}`;
    const signedQuantity = toSignedQuantity(movement);
    const existing = balanceByKey.get(key);

    if (existing) {
      existing.quantity_on_hand += signedQuantity;
      continue;
    }

    balanceByKey.set(key, {
      tenant_id: movement.tenant_id,
      warehouse_id: movement.warehouse_id,
      product_id: movement.product_id,
      quantity_on_hand: signedQuantity,
    });
  }

  return Array.from(balanceByKey.values()).sort((left, right) => {
    if (left.tenant_id !== right.tenant_id) {
      return left.tenant_id.localeCompare(right.tenant_id);
    }

    if (left.warehouse_id !== right.warehouse_id) {
      return left.warehouse_id.localeCompare(right.warehouse_id);
    }

    return left.product_id.localeCompare(right.product_id);
  });
}
