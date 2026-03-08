import { Injectable } from '@nestjs/common';
import { PrismaClient, type MovementType } from '@prisma/client';

import type { StockMovement, StockMovementType } from '../entities/stock-movement.entity.ts';
import type { IStockMovementRepository } from './stock-movement.repository.ts';

@Injectable()
export class PrismaStockMovementRepository implements IStockMovementRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async createMany(movements: StockMovement[]): Promise<StockMovement[]> {
    const created = await this.prisma.$transaction(
      movements.map((movement) =>
        this.prisma.stockMovement.create({
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
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        reference_id: referenceId,
      },
      orderBy: {
        occurred_at: 'asc',
      },
    });

    return movements.map((movement) => this.toDomain(movement));
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
}
