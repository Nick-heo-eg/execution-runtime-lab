/**
 * ALLOW-Only Execution Handler
 *
 * This module imports the executor and is ONLY used for ALLOW verdicts.
 * STOP/HOLD code paths must never import this module.
 *
 * Binary separation: STOP builds exclude this file and executor.ts.
 */

import { executeAction, ExecutionContext, ExecutionResult } from './executor';

/**
 * Creates an execution function for ALLOW verdicts
 *
 * This function can ONLY be called when verdict === 'ALLOW'
 * It wraps the executor module to provide a clean API
 *
 * @param context - Execution context
 * @returns Async function that executes the action
 */
export function createExecutionFunction(
  context: ExecutionContext
): () => Promise<ExecutionResult> {
  return async () => {
    console.log('[ALLOW_EXECUTION] Creating execution function for ALLOW verdict');
    return await executeAction(context);
  };
}

/**
 * Direct execution helper for ALLOW verdicts
 *
 * @param context - Execution context
 * @returns Execution result
 */
export async function executeAllowedAction(
  context: ExecutionContext
): Promise<ExecutionResult> {
  console.log('[ALLOW_EXECUTION] Executing allowed action');
  return await executeAction(context);
}
