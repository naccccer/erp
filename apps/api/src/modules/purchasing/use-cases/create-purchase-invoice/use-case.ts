import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { PurchaseInvoiceItem } from '../../entities/purchase-invoice-item.entity.ts';
import type { PurchaseInvoice } from '../../entities/purchase-invoice.entity.ts';
import {
  PURCHASE_INVOICE_REPOSITORY,
  type IPurchaseInvoiceRepository,
} from '../../infra/purchase-invoice.repository.ts';
import type { CreatePurchaseInvoiceDto } from './dto.ts';

@Injectable()
export class CreatePurchaseInvoiceUseCase {
  constructor(
    @Inject(PURCHASE_INVOICE_REPOSITORY)
    private readonly purchaseInvoiceRepository: IPurchaseInvoiceRepository,
  ) {}

  async execute(input: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    const invoiceId = randomUUID();

    const items: PurchaseInvoiceItem[] = input.items.map((item) => ({
      id: randomUUID(),
      tenant_id: input.tenant_id,
      invoice_id: invoiceId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      line_total: item.quantity * item.unit_cost,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0);

    const invoice: PurchaseInvoice = {
      id: invoiceId,
      tenant_id: input.tenant_id,
      supplier_id: input.supplier_id,
      invoice_date: input.invoice_date,
      status: 'Draft',
      total_amount: totalAmount,
      items,
    };

    return this.purchaseInvoiceRepository.create(invoice);
  }
}
