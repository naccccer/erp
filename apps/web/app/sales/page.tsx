import { SalesInvoicesPage } from '../../src/modules/sales/components/sales-invoices-page';

export const dynamic = 'force-dynamic';

type SalesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <SalesInvoicesPage searchParams={params} />;
}
