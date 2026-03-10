import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  preparePurchasingInvoiceConfirmedEvent,
  type PurchasingInvoiceConfirmedEvent,
} from '../../contract/purchasing.events.ts';
import type { PurchaseInvoice } from '../../entities/purchase-invoice.entity.ts';
import {
  PURCHASE_INVOICE_REPOSITORY,
  type IPurchaseInvoiceRepository,
} from '../../infra/purchase-invoice.repository.ts';
import { publishDomainEvents } from '../../../../shared/events/domain-event.publisher.ts';
import type { ConfirmPurchaseInvoiceDto } from './dto.ts';

export interface ConfirmPurchaseInvoiceResult {
  invoice: PurchaseInvoice;
  events: PurchasingInvoiceConfirmedEvent[];
}

@Injectable()
export class ConfirmPurchaseInvoiceUseCase {
  constructor(
    @Inject(PURCHASE_INVOICE_REPOSITORY)
    private readonly purchaseInvoiceRepository: IPurchaseInvoiceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: ConfirmPurchaseInvoiceDto): Promise<ConfirmPurchaseInvoiceResult> {
    if (input.invoice.status !== 'Draft') {
      throw new Error('Only draft purchase invoices can be confirmed.');
    }

    const confirmedInvoice: PurchaseInvoice = {
      ...input.invoice,
      status: 'Confirmed',
    };
    const persistedInvoice = await this.purchaseInvoiceRepository.update(confirmedInvoice);
    const event = preparePurchasingInvoiceConfirmedEvent(persistedInvoice);

    await publishDomainEvents(this.eventEmitter, [event]);

    return {
      invoice: persistedInvoice,
      events: [event],
    };
  }
}
