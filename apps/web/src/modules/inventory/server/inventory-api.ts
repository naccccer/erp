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

async function requestJson<T>(
  path: string,
  init?: RequestInit,
  tenantId = DEFAULT_TENANT_ID,
): Promise<T> {
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

export async function listInventoryMovementsByReference(
  referenceId: string,
  tenantId = DEFAULT_TENANT_ID,
): Promise<StockMovementDto[]> {
  return requestJson<StockMovementDto[]>(
    `/inventory/movements?invoiceId=${encodeURIComponent(referenceId)}`,
    undefined,
    tenantId,
  );
}

