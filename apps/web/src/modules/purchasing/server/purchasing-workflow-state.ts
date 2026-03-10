import type { PurchaseInvoiceDto, StockMovementDto } from './purchasing-api';

export type WorkflowStatus = 'idle' | 'success' | 'error';

export interface PurchasingWorkflowState {
  last_action_result: string;
  last_action_status: WorkflowStatus;
  draft_invoice: PurchaseInvoiceDto | null;
  confirmed_invoice: PurchaseInvoiceDto | null;
  inventory_movements: StockMovementDto[];
}

export function createInitialPurchasingWorkflowState(): PurchasingWorkflowState {
  return {
    last_action_result: 'هیچ عملیاتی ثبت نشده است.',
    last_action_status: 'idle',
    draft_invoice: null,
    confirmed_invoice: null,
    inventory_movements: [],
  };
}

export function parsePurchasingWorkflowState(
  serializedState: string | undefined,
): PurchasingWorkflowState {
  if (!serializedState) {
    return createInitialPurchasingWorkflowState();
  }

  try {
    const parsed = JSON.parse(serializedState) as Partial<PurchasingWorkflowState>;
    return {
      last_action_result:
        typeof parsed.last_action_result === 'string' && parsed.last_action_result.trim().length > 0
          ? parsed.last_action_result
          : createInitialPurchasingWorkflowState().last_action_result,
      last_action_status:
        parsed.last_action_status === 'success' || parsed.last_action_status === 'error'
          ? parsed.last_action_status
          : createInitialPurchasingWorkflowState().last_action_status,
      draft_invoice: parsed.draft_invoice ?? null,
      confirmed_invoice: parsed.confirmed_invoice ?? null,
      inventory_movements: Array.isArray(parsed.inventory_movements)
        ? parsed.inventory_movements
        : [],
    };
  } catch {
    return createInitialPurchasingWorkflowState();
  }
}

export function serializePurchasingWorkflowState(state: PurchasingWorkflowState): string {
  return JSON.stringify(state);
}
