import { Injectable } from '@nestjs/common';
import { PrismaClient, type MovementType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import type { StockMovement, StockMovementType } from '../entities/stock-movement.entity.ts';
import type { IStockMovementRepository } from './stock-movement.repository.ts';

@Injectable()
export class PrismaStockMovementRepository implements IStockMovementRepository {
  private prisma: PrismaClient | null = null;

  async createMany(movements: StockMovement[]): Promise<StockMovement[]> {
    const prisma = this.getPrisma();
    const created = await prisma.$transaction(
      movements.map((movement) =>
        prisma.stockMovement.create({
          data: {
            id: movement.id,
            tenant_id: movement.tenant_id,
            warehouse_id: movement.warehouse_id,
            product_id: movement.product_id,
            movement_type: movement.movement_type as MovementType,
            quantity: movement.quantity,
            occurred_at: movement.occurred_at,
            reference_type: movement.reference_type,
            reference_id: movement.reference_id,
          },
        }),
      ),
    );

    return created.map((movement) => this.toDomain(movement));
  }

  async findByReference(referenceId: string): Promise<StockMovement[]> {
    const movements = await this.getPrisma().stockMovement.findMany({
      where: {
        reference_id: referenceId,
      },
      orderBy: {
        occurred_at: 'asc',
      },
    });

    return movements.map((movement) => this.toDomain(movement));
  }

  async getAvailableStock(warehouseId: string, productId: string): Promise<number> {
    const movementTotals = await this.getPrisma().stockMovement.groupBy({
      by: ['movement_type'],
      where: {
        warehouse_id: warehouseId,
        product_id: productId,
      },
      _sum: {
        quantity: true,
      },
    });

    return movementTotals.reduce((availableStock, movementTotal) => {
      const quantity = Math.abs(movementTotal._sum.quantity ?? 0);
      return movementTotal.movement_type === 'IN'
        ? availableStock + quantity
        : availableStock - quantity;
    }, 0);
  }

  private toDomain(movement: {
    id: string;
    tenant_id: string;
    warehouse_id: string;
    product_id: string;
    movement_type: MovementType;
    quantity: number;
    occurred_at: Date;
    reference_type: string | null;
    reference_id: string | null;
  }): StockMovement {
    return {
      id: movement.id,
      tenant_id: movement.tenant_id,
      warehouse_id: movement.warehouse_id,
      product_id: movement.product_id,
      movement_type: movement.movement_type as StockMovementType,
      quantity: movement.quantity,
      occurred_at: movement.occurred_at,
      reference_type: movement.reference_type ?? undefined,
      reference_id: movement.reference_id ?? undefined,
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
