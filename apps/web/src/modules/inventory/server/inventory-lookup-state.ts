import type { StockMovementDto } from './inventory-api';

const DEFAULT_TENANT_ID = 'default';
const DEFAULT_REFERENCE_ID = 'purchase-invoice-1001';

export type WorkflowStatus = 'idle' | 'success' | 'error';

export interface InventoryLookupState {
  tenant_id: string;
  reference_id: string;
  last_action_result: string;
  last_action_status: WorkflowStatus;
  has_error: boolean;
  movements: StockMovementDto[];
}

export function createInitialInventoryLookupState(): InventoryLookupState {
  return {
    tenant_id: DEFAULT_TENANT_ID,
    reference_id: DEFAULT_REFERENCE_ID,
    last_action_result: 'هنوز جستجویی انجام نشده است.',
    last_action_status: 'idle',
    has_error: false,
    movements: [],
  };
}

export function parseInventoryLookupState(serializedState: string | undefined): InventoryLookupState {
  if (!serializedState) {
    return createInitialInventoryLookupState();
  }

  try {
    const parsed = JSON.parse(serializedState) as Partial<InventoryLookupState>;
    return {
      tenant_id:
        typeof parsed.tenant_id === 'string' && parsed.tenant_id.trim().length > 0
          ? parsed.tenant_id
          : createInitialInventoryLookupState().tenant_id,
      reference_id:
        typeof parsed.reference_id === 'string' && parsed.reference_id.trim().length > 0
          ? parsed.reference_id
          : createInitialInventoryLookupState().reference_id,
      last_action_result:
        typeof parsed.last_action_result === 'string' && parsed.last_action_result.trim().length > 0
          ? parsed.last_action_result
          : createInitialInventoryLookupState().last_action_result,
      last_action_status:
        parsed.last_action_status === 'success' || parsed.last_action_status === 'error'
          ? parsed.last_action_status
          : createInitialInventoryLookupState().last_action_status,
      has_error: parsed.has_error === true,
      movements: Array.isArray(parsed.movements) ? parsed.movements : [],
    };
  } catch {
    return createInitialInventoryLookupState();
  }
}

export function serializeInventoryLookupState(state: InventoryLookupState): string {
  return JSON.stringify(state);
}
