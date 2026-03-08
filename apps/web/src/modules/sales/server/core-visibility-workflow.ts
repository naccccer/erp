import { randomUUID } from 'node:crypto';

import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../packages/contracts/src/events/sales.events.ts';

export const DEFAULT_WAREHOUSE_ID = 'warehouse-default';

type SalesInvoiceStatus = 'Draft' | 'Confirmed' | 'Cancelled';
type StockMovementType = 'IN' | 'OUT';

interface SalesInvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

interface SalesInvoice {
  id: string;
  tenant_id: string;
  customer_id: string;
  invoice_date: Date;
  status: SalesInvoiceStatus;
  total_amount: number;
  items: SalesInvoiceItem[];
}

interface StockMovement {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  occurred_at: Date;
  reference_type: string;
  reference_id: string;
}

export interface CreateDraftSalesInvoiceInput {
  tenant_id: string;
  customer_id: string;
  invoice_date: Date;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface ConfirmDraftSalesInvoiceInput {
  invoice_id: string;
  warehouse_id?: string;
}

export interface SalesInvoiceVisibilityView {
  invoice: SalesInvoice;
  stock_movements: StockMovement[];
}

class CoreVisibilityWorkflow {
  private readonly invoicesById = new Map<string, SalesInvoice>();
  private readonly movementsByInvoiceId = new Map<string, StockMovement[]>();

  createDraftSalesInvoice(input: CreateDraftSalesInvoiceInput): SalesInvoice {
    const invoiceId = randomUUID();
    const itemLineTotal = input.quantity * input.unit_price - input.discount;

    const invoice: SalesInvoice = {
      id: invoiceId,
      tenant_id: input.tenant_id,
      customer_id: input.customer_id,
      invoice_date: input.invoice_date,
      status: 'Draft',
      total_amount: itemLineTotal,
      items: [
        {
          id: randomUUID(),
          tenant_id: input.tenant_id,
          invoice_id: invoiceId,
          product_id: input.product_id,
          quantity: input.quantity,
          unit_price: input.unit_price,
          discount: input.discount,
          line_total: itemLineTotal,
        },
      ],
    };

    this.invoicesById.set(invoice.id, invoice);
    return invoice;
  }

  confirmDraftSalesInvoice(input: ConfirmDraftSalesInvoiceInput): SalesInvoiceVisibilityView {
    const invoice = this.invoicesById.get(input.invoice_id);
    if (!invoice) {
      throw new Error('Sales invoice not found.');
    }

    if (invoice.status !== 'Draft') {
      throw new Error('Only draft sales invoices can be confirmed.');
    }

    const confirmedInvoice: SalesInvoice = {
      ...invoice,
      status: 'Confirmed',
    };

    const warehouseId = input.warehouse_id ?? DEFAULT_WAREHOUSE_ID;
    const stockMovements: StockMovement[] = confirmedInvoice.items.map((item) => ({
      id: randomUUID(),
      tenant_id: confirmedInvoice.tenant_id,
      warehouse_id: warehouseId,
      product_id: item.product_id,
      movement_type: 'OUT',
      quantity: item.quantity,
      occurred_at: confirmedInvoice.invoice_date,
      reference_type: SALES_INVOICE_CONFIRMED_EVENT,
      reference_id: confirmedInvoice.id,
    }));

    this.invoicesById.set(confirmedInvoice.id, confirmedInvoice);
    this.movementsByInvoiceId.set(confirmedInvoice.id, stockMovements);

    return {
      invoice: confirmedInvoice,
      stock_movements: [...stockMovements],
    };
  }

  listInvoiceViews(): SalesInvoiceVisibilityView[] {
    return Array.from(this.invoicesById.values())
      .sort((left, right) => right.invoice_date.getTime() - left.invoice_date.getTime())
      .map((invoice) => ({
        invoice,
        stock_movements: [...(this.movementsByInvoiceId.get(invoice.id) ?? [])],
      }));
  }

  reset(): void {
    this.invoicesById.clear();
    this.movementsByInvoiceId.clear();
  }
}

export const coreVisibilityWorkflow = new CoreVisibilityWorkflow();

export function resetCoreVisibilityWorkflowState(): void {
  coreVisibilityWorkflow.reset();
}
