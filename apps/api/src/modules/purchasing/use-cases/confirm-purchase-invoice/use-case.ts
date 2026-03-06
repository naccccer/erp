import {
  preparePurchasingInvoiceConfirmedEvent,
  type PurchasingInvoiceConfirmedEvent,
} from '../../contract/purchasing.events.ts';
import type { PurchaseInvoice } from '../../entities/purchase-invoice.entity.ts';
import type { ConfirmPurchaseInvoiceDto } from './dto.ts';

export interface ConfirmPurchaseInvoiceResult {
  invoice: PurchaseInvoice;
  events: PurchasingInvoiceConfirmedEvent[];
}

export class ConfirmPurchaseInvoiceUseCase {
  execute(input: ConfirmPurchaseInvoiceDto): ConfirmPurchaseInvoiceResult {
    if (input.invoice.status !== 'Draft') {
      throw new Error('Only draft purchase invoices can be confirmed.');
    }

    const confirmedInvoice: PurchaseInvoice = {
      ...input.invoice,
      status: 'Confirmed',
    };

    return {
      invoice: confirmedInvoice,
      events: [preparePurchasingInvoiceConfirmedEvent(confirmedInvoice)],
    };
  }
}
