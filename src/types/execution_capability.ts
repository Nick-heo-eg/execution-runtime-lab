/**
 * Type-Level Structural Execution Nullification
 *
 * STOP/HOLD verdicts structurally remove execution capability at the type system level.
 * This is NOT runtime blocking - execution paths cannot compile when verdict is STOP/HOLD.
 */

export type Verdict = 'ALLOW' | 'HOLD' | 'STOP';

/**
 * Conditional execution capability based on verdict.
 *
 * - ALLOW: execution function exists
 * - HOLD: execution function cannot exist (execute?: never)
 * - STOP: execution function cannot exist (execute?: never)
 *
 * Type system enforces structural absence at compile time.
 */
export type ExecutionCapability<V extends Verdict> = V extends 'ALLOW'
  ? {
      verdict: 'ALLOW';
      executed: false; // Not yet executed
      execute: () => Promise<{ success: boolean; result?: any; error?: string }>;
      proof_path: string;
      decision_hash: string;
      reason: string;
    }
  : V extends 'HOLD'
  ? {
      verdict: 'HOLD';
      executed: false;
      execute?: never; // Execution path does not exist
      proof_path: string;
      decision_hash: string;
      reason: string;
      requires_approval: true;
    }
  : V extends 'STOP'
  ? {
      verdict: 'STOP';
      executed: false;
      execute?: never; // Execution path does not exist
      proof_path: string;
      decision_hash: string;
      reason: string;
      blocked_at_compile_time: true;
    }
  : never;

/**
 * Type-safe decision result that enforces structural execution absence.
 *
 * When verdict is STOP or HOLD, attempting to access .execute() produces a compile-time error.
 */
export type DecisionResult =
  | ExecutionCapability<'ALLOW'>
  | ExecutionCapability<'HOLD'>
  | ExecutionCapability<'STOP'>;

/**
 * Type guard to check if execution is allowed (and thus execute() exists)
 */
export function canExecute(
  result: DecisionResult
): result is ExecutionCapability<'ALLOW'> {
  return result.verdict === 'ALLOW';
}

/**
 * Type guard to check if execution is structurally absent
 */
export function executionAbsent(
  result: DecisionResult
): result is ExecutionCapability<'STOP'> | ExecutionCapability<'HOLD'> {
  return result.verdict === 'STOP' || result.verdict === 'HOLD';
}
