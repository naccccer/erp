export interface SalesInvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}
