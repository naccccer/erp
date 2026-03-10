import { SalesInvoicesPage } from '../../src/modules/sales/components/sales-invoices-page';

export const dynamic = 'force-dynamic';

type SalesPageProps = {
  searchParams?: Promise<{
    tenant_id?: string;
  }>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const tenantId = typeof params?.tenant_id === 'string' && params.tenant_id.trim().length > 0
    ? params.tenant_id.trim()
    : 'default';

  return <SalesInvoicesPage tenantId={tenantId} />;
}
