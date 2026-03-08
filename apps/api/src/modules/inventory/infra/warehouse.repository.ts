import type { Warehouse } from '../entities/warehouse.entity.ts';

export const WAREHOUSE_REPOSITORY = Symbol('IWarehouseRepository');

export interface IWarehouseRepository {
  findDefaultByTenantId(tenantId: string): Promise<Warehouse | null>;
}
