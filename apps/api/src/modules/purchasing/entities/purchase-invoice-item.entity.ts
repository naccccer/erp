export interface PurchaseInvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}
