import type { StockMovement } from '../entities/stock-movement.entity.ts';

export const STOCK_MOVEMENT_REPOSITORY = Symbol('IStockMovementRepository');

export interface IStockMovementRepository {
  createMany(movements: StockMovement[]): Promise<StockMovement[]>;
  findByReference(referenceId: string): Promise<StockMovement[]>;
  getAvailableStock(warehouseId: string, productId: string): Promise<number>;
}
