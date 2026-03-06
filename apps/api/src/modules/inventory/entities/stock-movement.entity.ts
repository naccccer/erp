export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  occurred_at: Date;
  reference_type?: string;
  reference_id?: string;
}
