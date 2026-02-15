/**
 * STOP Verdict Handler
 *
 * This module handles STOP verdicts and MUST NOT import executor.
 * Binary separation ensures STOP builds can include this without executor bytecode.
 */

import { ExecutionCapability } from '../types/execution_capability';
import { Decision, DecisionInput } from '../../integrations/openclaw/decision_engine';
import { logOpenClawDecision } from '../../proof/openclaw_intercept/decision_logger';

/**
 * Handles STOP verdict - no execution capability
 *
 * CRITICAL: This function does NOT import or reference executor module
 *
 * @param decision - STOP decision from decision engine
 * @param input - Original decision input
 * @returns ExecutionCapability<'STOP'> with no execute function
 */
export async function handleStopVerdict(
  decision: Decision,
  input: DecisionInput
): Promise<ExecutionCapability<'STOP'>> {
  const proofPath = await logOpenClawDecision({
    input,
    decision,
    intercepted: true,
    source: 'openclaw_mock',
  });

  return {
    verdict: 'STOP',
    proof_path: proofPath,
    decision_hash: decision.decision_hash,
    reason: decision.reason || 'Execution stopped',
    executed: false,
    blocked_at_compile_time: true,
    // NO execute property - type system and binary separation enforce this
  };
}
