/**
 * OpenClaw Adapter - Tool Call Interception Layer
 *
 * Intercepts OpenClaw tool_call payloads and enforces EAR decision layer
 * BEFORE execution occurs.
 *
 * Flow:
 * OpenClaw generates tool_call → receiveToolCall() → EAR Decision Engine
 * → STOP verdict → Execution blocked, proof artifact generated
 */

import { evaluateDecision, Decision, DecisionInput } from './decision_engine';
import { logOpenClawDecision } from '../../proof/openclaw_intercept/decision_logger';

export interface OpenClawToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  metadata?: {
    source: string;
    timestamp: number;
    session_id?: string;
  };
}

export interface InterceptResult {
  decision: 'STOP' | 'HOLD' | 'ALLOW';
  proof_path?: string;
  decision_hash: string;
  reason?: string;
  executed: boolean;
}

/**
 * Receives OpenClaw tool call and enforces EAR decision
 * @param payload - OpenClaw tool_call object
 * @returns InterceptResult with decision, proof path, and execution status
 */
export async function receiveToolCall(
  payload: OpenClawToolCall
): Promise<InterceptResult> {
  // Convert OpenClaw tool_call to EAR DecisionInput format
  const decisionInput: DecisionInput = {
    action: payload.tool_name,
    resource: extractResource(payload.arguments),
    arguments: payload.arguments,
    metadata: {
      source: 'openclaw',
      timestamp: payload.metadata?.timestamp || Date.now(),
      session_id: payload.metadata?.session_id,
    },
  };

  // Call EAR decision engine
  const decision: Decision = await evaluateDecision(decisionInput);

  // If STOP verdict, block execution and generate proof artifact
  if (decision.verdict === 'STOP') {
    const proofPath = await logOpenClawDecision({
      input: decisionInput,
      decision,
      intercepted: true,
      source: 'openclaw_mock',
    });

    return {
      decision: 'STOP',
      proof_path: proofPath,
      decision_hash: decision.decision_hash,
      reason: decision.reason,
      executed: false,
    };
  }

  // HOLD verdict - requires external approval
  if (decision.verdict === 'HOLD') {
    const proofPath = await logOpenClawDecision({
      input: decisionInput,
      decision,
      intercepted: true,
      source: 'openclaw_mock',
    });

    return {
      decision: 'HOLD',
      proof_path: proofPath,
      decision_hash: decision.decision_hash,
      reason: decision.reason || 'External approval required',
      executed: false,
    };
  }

  // ALLOW verdict - execution may proceed (but NOT executed here)
  // This adapter only intercepts and returns decision
  const proofPath = await logOpenClawDecision({
    input: decisionInput,
    decision,
    intercepted: false,
    source: 'openclaw_mock',
  });

  return {
    decision: 'ALLOW',
    proof_path: proofPath,
    decision_hash: decision.decision_hash,
    executed: false, // Adapter does not execute, only intercepts
  };
}

/**
 * Extracts resource identifier from tool arguments
 * @param args - Tool call arguments
 * @returns Resource identifier string
 */
function extractResource(args: Record<string, any>): string {
  // Common resource field names
  const resourceFields = ['path', 'file', 'resource', 'target', 'host', 'url'];

  for (const field of resourceFields) {
    if (args[field]) {
      return String(args[field]);
    }
  }

  return 'unknown';
}
