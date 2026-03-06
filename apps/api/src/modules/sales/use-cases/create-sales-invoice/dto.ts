export interface CreateSalesInvoiceItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}

export interface CreateSalesInvoiceDto {
  tenant_id: string;
  customer_id: string;
  invoice_date: Date;
  items: CreateSalesInvoiceItemDto[];
}
