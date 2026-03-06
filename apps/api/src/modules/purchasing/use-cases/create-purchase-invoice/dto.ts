export interface CreatePurchaseInvoiceItemDto {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

export interface CreatePurchaseInvoiceDto {
  tenant_id: string;
  supplier_id: string;
  invoice_date: Date;
  items: CreatePurchaseInvoiceItemDto[];
}
