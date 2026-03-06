import {
  prepareSalesInvoiceConfirmedEvent,
  type SalesInvoiceConfirmedEvent,
} from '../../contract/sales.events';
import type { SalesInvoice } from '../../entities/sales-invoice.entity';
import type { ConfirmSalesInvoiceDto } from './dto';

export interface ConfirmSalesInvoiceResult {
  invoice: SalesInvoice;
  events: SalesInvoiceConfirmedEvent[];
}

export class ConfirmSalesInvoiceUseCase {
  execute(input: ConfirmSalesInvoiceDto): ConfirmSalesInvoiceResult {
    if (input.invoice.status !== 'Draft') {
      throw new Error('Only draft sales invoices can be confirmed.');
    }

    const confirmedInvoice: SalesInvoice = {
      ...input.invoice,
      status: 'Confirmed',
    };

    return {
      invoice: confirmedInvoice,
      events: [prepareSalesInvoiceConfirmedEvent(confirmedInvoice)],
    };
  }
}
