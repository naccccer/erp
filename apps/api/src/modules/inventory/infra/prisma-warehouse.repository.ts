import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { Warehouse } from '../entities/warehouse.entity.ts';
import type { IWarehouseRepository } from './warehouse.repository.ts';

@Injectable()
export class PrismaWarehouseRepository implements IWarehouseRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async findDefaultByTenantId(tenantId: string): Promise<Warehouse | null> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        tenant_id: tenantId,
        is_active: true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    if (!warehouse) {
      return null;
    }

    return {
      id: warehouse.id,
      tenant_id: warehouse.tenant_id,
      code: warehouse.code,
      name: warehouse.name,
      is_active: warehouse.is_active,
    };
  }
}
