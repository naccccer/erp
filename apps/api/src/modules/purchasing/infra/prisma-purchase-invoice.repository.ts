import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type InvoiceStatus } from '@prisma/client';

import type { PurchaseInvoiceItem } from '../entities/purchase-invoice-item.entity.ts';
import type {
  PurchaseInvoice,
  PurchaseInvoiceStatus,
} from '../entities/purchase-invoice.entity.ts';
import type { IPurchaseInvoiceRepository } from './purchase-invoice.repository.ts';

@Injectable()
export class PrismaPurchaseInvoiceRepository implements IPurchaseInvoiceRepository {
  private prisma: PrismaClient | null = null;

  async create(invoice: PurchaseInvoice): Promise<PurchaseInvoice> {
    const created = await this.getPrisma().purchaseInvoice.create({
      data: {
        id: invoice.id,
        tenant_id: invoice.tenant_id,
        supplier_id: invoice.supplier_id,
        invoice_date: invoice.invoice_date,
        status: invoice.status as InvoiceStatus,
        total_amount: invoice.total_amount,
        items: {
          create: invoice.items.map((item) => ({
            id: item.id,
            tenant_id: item.tenant_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            line_total: item.line_total,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.toDomain(created);
  }

  async update(invoice: PurchaseInvoice): Promise<PurchaseInvoice> {
    const updatedRows = await this.getPrisma().purchaseInvoice.updateMany({
      where: {
        id: invoice.id,
        tenant_id: invoice.tenant_id,
      },
      data: {
        status: invoice.status as InvoiceStatus,
      },
    });

    if (updatedRows.count === 0) {
      throw new Error(
        `Purchase invoice "${invoice.id}" was not found for tenant "${invoice.tenant_id}".`,
      );
    }

    const updated = await this.getPrisma().purchaseInvoice.findFirst({
      where: {
        id: invoice.id,
        tenant_id: invoice.tenant_id,
      },
      include: {
        items: true,
      },
    });

    if (!updated) {
      throw new Error(
        `Purchase invoice "${invoice.id}" was not found for tenant "${invoice.tenant_id}".`,
      );
    }

    return this.toDomain(updated);
  }

  private toDomain(invoice: {
    id: string;
    tenant_id: string;
    supplier_id: string;
    invoice_date: Date;
    status: InvoiceStatus;
    total_amount: number;
    items: Array<{
      id: string;
      tenant_id: string;
      invoice_id: string;
      product_id: string;
      quantity: number;
      unit_cost: number;
      line_total: number;
    }>;
  }): PurchaseInvoice {
    const items: PurchaseInvoiceItem[] = invoice.items.map((item) => ({
      id: item.id,
      tenant_id: item.tenant_id,
      invoice_id: item.invoice_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      line_total: item.line_total,
    }));

    return {
      id: invoice.id,
      tenant_id: invoice.tenant_id,
      supplier_id: invoice.supplier_id,
      invoice_date: invoice.invoice_date,
      status: invoice.status as PurchaseInvoiceStatus,
      total_amount: invoice.total_amount,
      items,
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
