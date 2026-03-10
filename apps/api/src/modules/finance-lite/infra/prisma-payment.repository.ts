import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import type { Payment, PaymentStatus } from '../entities/payment.entity.ts';
import type { IPaymentRepository } from './payment.repository.ts';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  private prisma: PrismaClient | null = null;

  async create(payment: Payment): Promise<Payment> {
    const created = await this.getPrisma().payment.create({
      data: {
        id: payment.id,
        tenant_id: payment.tenant_id,
        reference_type: payment.reference_type,
        reference_id: payment.reference_id,
        amount: payment.amount,
        paid_at: payment.paid_at,
        status: payment.status,
      },
    });

    return {
      id: created.id,
      tenant_id: created.tenant_id,
      reference_type: created.reference_type,
      reference_id: created.reference_id,
      amount: created.amount,
      paid_at: created.paid_at,
      status: created.status as PaymentStatus,
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
