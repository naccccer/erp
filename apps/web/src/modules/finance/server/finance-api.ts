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

export interface PaymentDto {
  id: string;
  tenant_id: string;
  reference_type: string;
  reference_id: string;
  amount: number;
  paid_at: string;
  status: 'Registered' | 'Cancelled';
}

export interface RegisterPaymentApiInput {
  tenant_id: string;
  reference_type: string;
  reference_id: string;
  amount: number;
  paid_at: string;
}

export async function registerPayment(input: RegisterPaymentApiInput): Promise<PaymentDto> {
  return requestJson<PaymentDto>(
    '/finance/payments',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    input.tenant_id,
  );
}

