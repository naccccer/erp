import type { PaymentDto } from './finance-api';

export type WorkflowStatus = 'idle' | 'success' | 'error';

export interface FinanceWorkflowState {
  last_action_result: string;
  last_action_status: WorkflowStatus;
  has_error: boolean;
  last_registered_payment: PaymentDto | null;
}

export function createInitialFinanceWorkflowState(): FinanceWorkflowState {
  return {
    last_action_result: 'هیچ پرداختی ثبت نشده است.',
    last_action_status: 'idle',
    has_error: false,
    last_registered_payment: null,
  };
}

export function parseFinanceWorkflowState(serializedState: string | undefined): FinanceWorkflowState {
  if (!serializedState) {
    return createInitialFinanceWorkflowState();
  }

  try {
    const parsed = JSON.parse(serializedState) as Partial<FinanceWorkflowState>;
    return {
      last_action_result:
        typeof parsed.last_action_result === 'string' && parsed.last_action_result.trim().length > 0
          ? parsed.last_action_result
          : createInitialFinanceWorkflowState().last_action_result,
      last_action_status:
        parsed.last_action_status === 'success' || parsed.last_action_status === 'error'
          ? parsed.last_action_status
          : createInitialFinanceWorkflowState().last_action_status,
      has_error: parsed.has_error === true,
      last_registered_payment: parsed.last_registered_payment ?? null,
    };
  } catch {
    return createInitialFinanceWorkflowState();
  }
}

export function serializeFinanceWorkflowState(state: FinanceWorkflowState): string {
  return JSON.stringify(state);
}
