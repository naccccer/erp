export const DEMO_TENANT_ID = 'default';

export interface DemoWarehouse {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export interface DemoProduct {
  id: string;
  tenant_id: string;
  name: string;
  sku: string;
}

export interface DemoCustomer {
  id: string;
  tenant_id: string;
  display_name: string;
}

export interface DemoSupplier {
  id: string;
  tenant_id: string;
  display_name: string;
}

export interface DemoSalesInvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface DemoSalesInvoice {
  id: string;
  tenant_id: string;
  customer_id: string;
  invoice_date: Date;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  total_amount: number;
  items: DemoSalesInvoiceItem[];
}

export interface DemoPurchaseInvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface DemoPurchaseInvoice {
  id: string;
  tenant_id: string;
  supplier_id: string;
  invoice_date: Date;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  total_amount: number;
  items: DemoPurchaseInvoiceItem[];
}

export interface DemoStockMovement {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  occurred_at: Date;
  reference_type?: string;
  reference_id?: string;
}

export interface DemoPayment {
  id: string;
  tenant_id: string;
  reference_type: string;
  reference_id: string;
  amount: number;
  paid_at: Date;
  status: string;
}

export interface DemoDataset {
  warehouses: DemoWarehouse[];
  products: DemoProduct[];
  customers: DemoCustomer[];
  suppliers: DemoSupplier[];
  sales_invoices: DemoSalesInvoice[];
  purchase_invoices: DemoPurchaseInvoice[];
  stock_movements: DemoStockMovement[];
  payments: DemoPayment[];
}

function utcDate(value: string): Date {
  return new Date(value);
}

export function buildDemoDataset(): DemoDataset {
  return {
    warehouses: [
      {
        id: 'warehouse-main',
        tenant_id: DEMO_TENANT_ID,
        code: 'WH-TEH-01',
        name: 'انبار مرکزی تهران',
        is_active: true,
      },
    ],
    products: [
      {
        id: 'product-1',
        tenant_id: DEMO_TENANT_ID,
        name: 'کاغذ A4',
        sku: 'PAPER-A4',
      },
      {
        id: 'product-2',
        tenant_id: DEMO_TENANT_ID,
        name: 'خودکار آبی',
        sku: 'PEN-BLUE',
      },
    ],
    customers: [
      {
        id: 'customer-1',
        tenant_id: DEMO_TENANT_ID,
        display_name: 'مشتری نمونه یک',
      },
      {
        id: 'customer-2',
        tenant_id: DEMO_TENANT_ID,
        display_name: 'مشتری نمونه دو',
      },
    ],
    suppliers: [
      {
        id: 'supplier-1',
        tenant_id: DEMO_TENANT_ID,
        display_name: 'تامین کننده نمونه یک',
      },
      {
        id: 'supplier-2',
        tenant_id: DEMO_TENANT_ID,
        display_name: 'تامین کننده نمونه دو',
      },
    ],
    purchase_invoices: [
      {
        id: 'purchase-invoice-1001',
        tenant_id: DEMO_TENANT_ID,
        supplier_id: 'supplier-1',
        invoice_date: utcDate('2026-03-01T08:00:00.000Z'),
        status: 'Confirmed',
        total_amount: 8400000,
        items: [
          {
            id: 'purchase-item-1001-1',
            tenant_id: DEMO_TENANT_ID,
            invoice_id: 'purchase-invoice-1001',
            product_id: 'product-1',
            quantity: 50,
            unit_cost: 120000,
            line_total: 6000000,
          },
          {
            id: 'purchase-item-1001-2',
            tenant_id: DEMO_TENANT_ID,
            invoice_id: 'purchase-invoice-1001',
            product_id: 'product-2',
            quantity: 30,
            unit_cost: 80000,
            line_total: 2400000,
          },
        ],
      },
      {
        id: 'purchase-invoice-1002',
        tenant_id: DEMO_TENANT_ID,
        supplier_id: 'supplier-2',
        invoice_date: utcDate('2026-03-05T08:00:00.000Z'),
        status: 'Draft',
        total_amount: 1800000,
        items: [
          {
            id: 'purchase-item-1002-1',
            tenant_id: DEMO_TENANT_ID,
            invoice_id: 'purchase-invoice-1002',
            product_id: 'product-1',
            quantity: 15,
            unit_cost: 120000,
            line_total: 1800000,
          },
        ],
      },
    ],
    sales_invoices: [
      {
        id: 'sales-invoice-1001',
        tenant_id: DEMO_TENANT_ID,
        customer_id: 'customer-1',
        invoice_date: utcDate('2026-03-06T08:00:00.000Z'),
        status: 'Confirmed',
        total_amount: 850000,
        items: [
          {
            id: 'sales-item-1001-1',
            tenant_id: DEMO_TENANT_ID,
            invoice_id: 'sales-invoice-1001',
            product_id: 'product-1',
            quantity: 5,
            unit_price: 170000,
            discount: 0,
            line_total: 850000,
          },
        ],
      },
      {
        id: 'sales-invoice-1002',
        tenant_id: DEMO_TENANT_ID,
        customer_id: 'customer-2',
        invoice_date: utcDate('2026-03-07T08:00:00.000Z'),
        status: 'Draft',
        total_amount: 330000,
        items: [
          {
            id: 'sales-item-1002-1',
            tenant_id: DEMO_TENANT_ID,
            invoice_id: 'sales-invoice-1002',
            product_id: 'product-2',
            quantity: 3,
            unit_price: 110000,
            discount: 0,
            line_total: 330000,
          },
        ],
      },
    ],
    stock_movements: [
      {
        id: 'stock-movement-0001',
        tenant_id: DEMO_TENANT_ID,
        warehouse_id: 'warehouse-main',
        product_id: 'product-1',
        movement_type: 'IN',
        quantity: 60,
        occurred_at: utcDate('2026-02-28T08:00:00.000Z'),
        reference_type: 'inventory.seed',
        reference_id: 'opening-balance',
      },
      {
        id: 'stock-movement-0002',
        tenant_id: DEMO_TENANT_ID,
        warehouse_id: 'warehouse-main',
        product_id: 'product-2',
        movement_type: 'IN',
        quantity: 40,
        occurred_at: utcDate('2026-02-28T08:00:00.000Z'),
        reference_type: 'inventory.seed',
        reference_id: 'opening-balance',
      },
      {
        id: 'stock-movement-1001',
        tenant_id: DEMO_TENANT_ID,
        warehouse_id: 'warehouse-main',
        product_id: 'product-1',
        movement_type: 'IN',
        quantity: 50,
        occurred_at: utcDate('2026-03-01T09:00:00.000Z'),
        reference_type: 'purchasing.invoice.confirmed',
        reference_id: 'purchase-invoice-1001',
      },
      {
        id: 'stock-movement-1002',
        tenant_id: DEMO_TENANT_ID,
        warehouse_id: 'warehouse-main',
        product_id: 'product-2',
        movement_type: 'IN',
        quantity: 30,
        occurred_at: utcDate('2026-03-01T09:05:00.000Z'),
        reference_type: 'purchasing.invoice.confirmed',
        reference_id: 'purchase-invoice-1001',
      },
      {
        id: 'stock-movement-2001',
        tenant_id: DEMO_TENANT_ID,
        warehouse_id: 'warehouse-main',
        product_id: 'product-1',
        movement_type: 'OUT',
        quantity: 5,
        occurred_at: utcDate('2026-03-06T10:00:00.000Z'),
        reference_type: 'sales.invoice.confirmed',
        reference_id: 'sales-invoice-1001',
      },
    ],
    payments: [
      {
        id: 'payment-1001',
        tenant_id: DEMO_TENANT_ID,
        reference_type: 'sales.invoice',
        reference_id: 'sales-invoice-1001',
        amount: 500000,
        paid_at: utcDate('2026-03-08T12:00:00.000Z'),
        status: 'Registered',
      },
      {
        id: 'payment-1002',
        tenant_id: DEMO_TENANT_ID,
        reference_type: 'purchase.invoice',
        reference_id: 'purchase-invoice-1001',
        amount: 2000000,
        paid_at: utcDate('2026-03-08T12:30:00.000Z'),
        status: 'Registered',
      },
    ],
  };
}
