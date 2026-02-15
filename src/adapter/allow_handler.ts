/**
 * ALLOW Verdict Handler
 *
 * This module handles ALLOW verdicts and imports executor module.
 * EXCLUDED from STOP builds - contains executor bytecode reference.
 */

import { ExecutionCapability } from '../types/execution_capability';
import { Decision, DecisionInput } from '../../integrations/openclaw/decision_engine';
import { logOpenClawDecision } from '../../proof/openclaw_intercept/decision_logger';
import { createExecutionFunction } from '../executor/allow_execution';

/**
 * Handles ALLOW verdict - creates execution capability
 *
 * CRITICAL: This function DOES import executor module
 * This file is EXCLUDED from STOP builds via tsconfig.stop.json
 *
 * @param decision - ALLOW decision from decision engine
 * @param input - Original decision input
 * @param payload - Original tool call payload
 * @returns ExecutionCapability<'ALLOW'> with execute function
 */
export async function handleAllowVerdict(
  decision: Decision,
  input: DecisionInput,
  payload: { tool_name: string; arguments: Record<string, any> }
): Promise<ExecutionCapability<'ALLOW'>> {
  const proofPath = await logOpenClawDecision({
    input,
    decision,
    intercepted: false,
    source: 'openclaw_mock',
  });

  // Create execution context from payload
  const executionContext = {
    tool_name: payload.tool_name,
    arguments: payload.arguments,
    metadata: {
      source: 'openclaw',
      timestamp: Date.now(),
    },
  };

  // Create execute function using executor module
  const executeFunction = createExecutionFunction(executionContext);

  return {
    verdict: 'ALLOW',
    proof_path: proofPath,
    decision_hash: decision.decision_hash,
    reason: decision.reason || 'Execution allowed',
    executed: false,
    execute: executeFunction,
  };
}
