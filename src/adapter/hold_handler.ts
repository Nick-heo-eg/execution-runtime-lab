/**
 * HOLD Verdict Handler
 *
 * This module handles HOLD verdicts and MUST NOT import executor.
 * Binary separation ensures HOLD builds can include this without executor bytecode.
 */

import { ExecutionCapability } from '../types/execution_capability';
import { Decision, DecisionInput } from '../../integrations/openclaw/decision_engine';
import { logOpenClawDecision } from '../../proof/openclaw_intercept/decision_logger';

/**
 * Handles HOLD verdict - no execution capability
 *
 * CRITICAL: This function does NOT import or reference executor module
 *
 * @param decision - HOLD decision from decision engine
 * @param input - Original decision input
 * @returns ExecutionCapability<'HOLD'> with no execute function
 */
export async function handleHoldVerdict(
  decision: Decision,
  input: DecisionInput
): Promise<ExecutionCapability<'HOLD'>> {
  const proofPath = await logOpenClawDecision({
    input,
    decision,
    intercepted: true,
    source: 'openclaw_mock',
  });

  return {
    verdict: 'HOLD',
    proof_path: proofPath,
    decision_hash: decision.decision_hash,
    reason: decision.reason || 'External approval required',
    executed: false,
    requires_approval: true,
    // NO execute property - type system and binary separation enforce this
  };
}
