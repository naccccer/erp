export interface InsufficientStockErrorInput {
  warehouseId: string;
  productId: string;
  requestedQuantity: number;
  availableQuantity: number;
}

export class InsufficientStockError extends Error {
  readonly warehouseId: string;
  readonly productId: string;
  readonly requestedQuantity: number;
  readonly availableQuantity: number;

  constructor(input: InsufficientStockErrorInput) {
    super(
      `Insufficient stock for product "${input.productId}" in warehouse "${input.warehouseId}". Requested ${input.requestedQuantity}, available ${input.availableQuantity}.`,
    );
    this.name = 'InsufficientStockError';
    this.warehouseId = input.warehouseId;
    this.productId = input.productId;
    this.requestedQuantity = input.requestedQuantity;
    this.availableQuantity = input.availableQuantity;
  }
}
