import type { SalesInvoiceDto } from './sales-api';

type SearchParamValue = string | string[] | undefined;

export type SalesOpsSearchParams = Record<string, SearchParamValue>;

export const SALES_SORT_FIELDS = [
  'invoice_date',
  'total_amount',
  'customer_id',
  'status',
] as const;

export const SALES_SORT_DIRECTIONS = ['asc', 'desc'] as const;
export const SALES_STATUS_FILTERS = ['all', 'Draft', 'Confirmed', 'Cancelled'] as const;
export const SALES_PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

export type SalesSortField = (typeof SALES_SORT_FIELDS)[number];
export type SalesSortDirection = (typeof SALES_SORT_DIRECTIONS)[number];
export type SalesStatusFilter = (typeof SALES_STATUS_FILTERS)[number];

export interface SalesOpsQueryState {
  tenantId: string;
  invoiceIdFilter: string;
  customerIdFilter: string;
  statusFilter: SalesStatusFilter;
  sortBy: SalesSortField;
  sortDirection: SalesSortDirection;
  page: number;
  pageSize: (typeof SALES_PAGE_SIZE_OPTIONS)[number];
  selectedInvoiceId: string;
}

export interface SalesOpsListResult {
  filteredInvoices: SalesInvoiceDto[];
  pagedInvoices: SalesInvoiceDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

function readFirst(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first.trim() : '';
  }

  return typeof value === 'string' ? value.trim() : '';
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function normalizePageSize(value: string): (typeof SALES_PAGE_SIZE_OPTIONS)[number] {
  const parsed = Number.parseInt(value, 10);
  return SALES_PAGE_SIZE_OPTIONS.find((option) => option === parsed) ?? 10;
}

function normalizeSortBy(value: string): SalesSortField {
  return SALES_SORT_FIELDS.find((option) => option === value) ?? 'invoice_date';
}

function normalizeSortDirection(value: string): SalesSortDirection {
  return SALES_SORT_DIRECTIONS.find((option) => option === value) ?? 'desc';
}

function normalizeStatus(value: string): SalesStatusFilter {
  return SALES_STATUS_FILTERS.find((option) => option === value) ?? 'all';
}

function statusWeight(status: SalesInvoiceDto['status']): number {
  if (status === 'Draft') {
    return 0;
  }

  if (status === 'Confirmed') {
    return 1;
  }

  return 2;
}

function compareInvoices(
  left: SalesInvoiceDto,
  right: SalesInvoiceDto,
  sortBy: SalesSortField,
  sortDirection: SalesSortDirection,
): number {
  const directionFactor = sortDirection === 'asc' ? 1 : -1;

  if (sortBy === 'invoice_date') {
    const delta =
      new Date(left.invoice_date).getTime() - new Date(right.invoice_date).getTime();
    if (delta !== 0) {
      return delta * directionFactor;
    }
  } else if (sortBy === 'total_amount') {
    const delta = left.total_amount - right.total_amount;
    if (delta !== 0) {
      return delta * directionFactor;
    }
  } else if (sortBy === 'customer_id') {
    const delta = left.customer_id.localeCompare(right.customer_id);
    if (delta !== 0) {
      return delta * directionFactor;
    }
  } else {
    const delta = statusWeight(left.status) - statusWeight(right.status);
    if (delta !== 0) {
      return delta * directionFactor;
    }
  }

  return left.id.localeCompare(right.id) * directionFactor;
}

export function readSalesOpsQuery(
  searchParams: SalesOpsSearchParams | undefined,
  tenantFallback = 'default',
): SalesOpsQueryState {
  const rawTenantId = readFirst(searchParams?.tenant_id);

  return {
    tenantId: rawTenantId.length > 0 ? rawTenantId : tenantFallback,
    invoiceIdFilter: readFirst(searchParams?.invoice_id),
    customerIdFilter: readFirst(searchParams?.customer_id),
    statusFilter: normalizeStatus(readFirst(searchParams?.status)),
    sortBy: normalizeSortBy(readFirst(searchParams?.sort_by)),
    sortDirection: normalizeSortDirection(readFirst(searchParams?.sort_direction)),
    page: normalizePage(readFirst(searchParams?.page)),
    pageSize: normalizePageSize(readFirst(searchParams?.page_size)),
    selectedInvoiceId: readFirst(searchParams?.selected_invoice_id),
  };
}

export function applySalesOpsList(
  invoices: SalesInvoiceDto[],
  query: SalesOpsQueryState,
): SalesOpsListResult {
  const invoiceFilter = query.invoiceIdFilter.toLowerCase();
  const customerFilter = query.customerIdFilter.toLowerCase();

  const filteredInvoices = invoices.filter((invoice) => {
    if (query.statusFilter !== 'all' && invoice.status !== query.statusFilter) {
      return false;
    }

    if (invoiceFilter.length > 0 && !invoice.id.toLowerCase().includes(invoiceFilter)) {
      return false;
    }

    if (
      customerFilter.length > 0
      && !invoice.customer_id.toLowerCase().includes(customerFilter)
    ) {
      return false;
    }

    return true;
  });

  const sortedInvoices = [...filteredInvoices].sort((left, right) =>
    compareInvoices(left, right, query.sortBy, query.sortDirection),
  );

  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / query.pageSize));
  const currentPage = Math.min(query.page, totalPages);
  const start = (currentPage - 1) * query.pageSize;
  const end = start + query.pageSize;
  const pagedInvoices = sortedInvoices.slice(start, end);

  return {
    filteredInvoices: sortedInvoices,
    pagedInvoices,
    totalCount: sortedInvoices.length,
    totalPages,
    currentPage,
  };
}

export function buildSalesOpsHref(
  query: SalesOpsQueryState,
  overrides: Partial<SalesOpsQueryState> = {},
): string {
  const merged: SalesOpsQueryState = {
    ...query,
    ...overrides,
  };

  const params = new URLSearchParams();
  params.set('tenant_id', merged.tenantId);

  if (merged.invoiceIdFilter) {
    params.set('invoice_id', merged.invoiceIdFilter);
  }

  if (merged.customerIdFilter) {
    params.set('customer_id', merged.customerIdFilter);
  }

  if (merged.statusFilter !== 'all') {
    params.set('status', merged.statusFilter);
  }

  params.set('sort_by', merged.sortBy);
  params.set('sort_direction', merged.sortDirection);
  params.set('page', String(merged.page));
  params.set('page_size', String(merged.pageSize));

  if (merged.selectedInvoiceId) {
    params.set('selected_invoice_id', merged.selectedInvoiceId);
  }

  return `/sales?${params.toString()}`;
}
