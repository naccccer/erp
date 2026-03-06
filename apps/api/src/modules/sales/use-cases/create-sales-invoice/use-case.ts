import { randomUUID } from 'node:crypto';

import type { SalesInvoiceItem } from '../../entities/sales-invoice-item.entity';
import type { SalesInvoice } from '../../entities/sales-invoice.entity';
import type { CreateSalesInvoiceDto } from './dto';

export class CreateSalesInvoiceUseCase {
  execute(input: CreateSalesInvoiceDto): SalesInvoice {
    const invoiceId = randomUUID();

    const items: SalesInvoiceItem[] = input.items.map((item) => {
      const discount = item.discount ?? 0;
      const lineTotal = item.quantity * item.unit_price - discount;

      return {
        id: randomUUID(),
        tenant_id: input.tenant_id,
        invoice_id: invoiceId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount,
        line_total: lineTotal,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0);

    return {
      id: invoiceId,
      tenant_id: input.tenant_id,
      customer_id: input.customer_id,
      invoice_date: input.invoice_date,
      status: 'Draft',
      total_amount: totalAmount,
      items,
    };
  }
}
