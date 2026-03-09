import { Injectable } from '@nestjs/common';
import { PrismaClient, type InvoiceStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import type { SalesInvoiceItem } from '../entities/sales-invoice-item.entity';
import type { SalesInvoice, SalesInvoiceStatus } from '../entities/sales-invoice.entity';
import type { ISalesInvoiceRepository } from './sales-invoice.repository';

@Injectable()
export class PrismaSalesInvoiceRepository implements ISalesInvoiceRepository {
  private prisma: PrismaClient | null = null;

  async create(invoice: SalesInvoice): Promise<SalesInvoice> {
    const created = await this.getPrisma().salesInvoice.create({
      data: {
        id: invoice.id,
        tenant_id: invoice.tenant_id,
        customer_id: invoice.customer_id,
        invoice_date: invoice.invoice_date,
        status: invoice.status as InvoiceStatus,
        total_amount: invoice.total_amount,
        items: {
          create: invoice.items.map((item) => ({
            id: item.id,
            tenant_id: item.tenant_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
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

  async update(invoice: SalesInvoice): Promise<SalesInvoice> {
    const updated = await this.getPrisma().salesInvoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: invoice.status as InvoiceStatus,
      },
      include: {
        items: true,
      },
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<SalesInvoice | null> {
    const invoice = await this.getPrisma().salesInvoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return invoice ? this.toDomain(invoice) : null;
  }

  async listByTenant(tenantId: string): Promise<SalesInvoice[]> {
    const invoices = await this.getPrisma().salesInvoice.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        items: true,
      },
      orderBy: {
        invoice_date: 'desc',
      },
    });

    return invoices.map((invoice) => this.toDomain(invoice));
  }

  private toDomain(invoice: {
    id: string;
    tenant_id: string;
    customer_id: string;
    invoice_date: Date;
    status: InvoiceStatus;
    total_amount: number;
    items: Array<{
      id: string;
      tenant_id: string;
      invoice_id: string;
      product_id: string;
      quantity: number;
      unit_price: number;
      discount: number;
      line_total: number;
    }>;
  }): SalesInvoice {
    const items: SalesInvoiceItem[] = invoice.items.map((item) => ({
      id: item.id,
      tenant_id: item.tenant_id,
      invoice_id: item.invoice_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      line_total: item.line_total,
    }));

    return {
      id: invoice.id,
      tenant_id: invoice.tenant_id,
      customer_id: invoice.customer_id,
      invoice_date: invoice.invoice_date,
      status: invoice.status as SalesInvoiceStatus,
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
