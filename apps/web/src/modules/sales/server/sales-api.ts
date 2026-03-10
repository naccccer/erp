const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const DEFAULT_TENANT_ID = 'default';
const DEFAULT_ROLE = 'manager';

function apiBaseUrl(): string {
  const value = process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveRole(): string {
  return process.env.WEB_ROLE ?? DEFAULT_ROLE;
}

function tenantHeaders(tenantId: string): Record<string, string> {
  return {
    'x-tenant-id': tenantId,
    'x-role': resolveRole(),
  };
}

async function requestJson<T>(path: string, init?: RequestInit, tenantId = DEFAULT_TENANT_ID): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...tenantHeaders(tenantId),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
}

export interface SalesInvoiceItemDto {
  id: string;
  tenant_id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface SalesInvoiceDto {
  id: string;
  tenant_id: string;
  customer_id: string;
  invoice_date: string;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  total_amount: number;
  items: SalesInvoiceItemDto[];
}

export interface StockMovementDto {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  product_id: string;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  occurred_at: string;
  reference_type?: string;
  reference_id?: string;
}

export interface CreateSalesInvoiceApiInput {
  tenant_id: string;
  customer_id: string;
  invoice_date: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
  }>;
}

export async function createSalesInvoice(input: CreateSalesInvoiceApiInput): Promise<SalesInvoiceDto> {
  return requestJson<SalesInvoiceDto>('/sales/invoices', {
    method: 'POST',
    body: JSON.stringify(input),
  }, input.tenant_id);
}

export async function confirmSalesInvoice(invoice: SalesInvoiceDto): Promise<{
  invoice: SalesInvoiceDto;
}> {
  return requestJson<{ invoice: SalesInvoiceDto }>(`/sales/invoices/${invoice.id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ invoice }),
  }, invoice.tenant_id);
}

export async function listSalesInvoices(tenantId: string): Promise<SalesInvoiceDto[]> {
  return requestJson<SalesInvoiceDto[]>(`/sales/invoices?tenant_id=${encodeURIComponent(tenantId)}`, undefined, tenantId);
}

export async function listInventoryMovements(invoiceId: string, tenantId = DEFAULT_TENANT_ID): Promise<StockMovementDto[]> {
  return requestJson<StockMovementDto[]>(
    `/inventory/movements?invoiceId=${encodeURIComponent(invoiceId)}`,
    undefined,
    tenantId,
  );
}
