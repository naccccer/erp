import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import type { Warehouse } from '../entities/warehouse.entity.ts';
import type { IWarehouseRepository } from './warehouse.repository.ts';

@Injectable()
export class PrismaWarehouseRepository implements IWarehouseRepository {
  private prisma: PrismaClient | null = null;

  async findDefaultByTenantId(tenantId: string): Promise<Warehouse | null> {
    const warehouse = await this.getPrisma().warehouse.findFirst({
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

  private getPrisma(): PrismaClient {
    if (!this.prisma) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL is not set.');
      }

      this.prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
      });
    }

    return this.prisma;
  }
}
