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
import { ExecutionCapability, DecisionResult } from '../../src/types/execution_capability';

export interface OpenClawToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  metadata?: {
    source: string;
    timestamp: number;
    session_id?: string;
  };
}

// Legacy interface - replaced by ExecutionCapability
export interface InterceptResult {
  decision: 'STOP' | 'HOLD' | 'ALLOW';
  proof_path?: string;
  decision_hash: string;
  reason?: string;
  executed: boolean;
}

/**
 * Receives OpenClaw tool call and enforces EAR decision with type-level execution nullification
 * @param payload - OpenClaw tool_call object
 * @returns DecisionResult with verdict-dependent execution capability
 */
export async function receiveToolCall(
  payload: OpenClawToolCall
): Promise<DecisionResult> {
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
  // Type system enforces: execute property CANNOT exist
  if (decision.verdict === 'STOP') {
    const proofPath = await logOpenClawDecision({
      input: decisionInput,
      decision,
      intercepted: true,
      source: 'openclaw_mock',
    });

    return {
      verdict: 'STOP',
      proof_path: proofPath,
      decision_hash: decision.decision_hash,
      reason: decision.reason,
      executed: false,
      blocked_at_compile_time: true,
      // execute property does NOT exist - enforced by ExecutionCapability<'STOP'>
    };
  }

  // HOLD verdict - requires external approval
  // Type system enforces: execute property CANNOT exist
  if (decision.verdict === 'HOLD') {
    const proofPath = await logOpenClawDecision({
      input: decisionInput,
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
      // execute property does NOT exist - enforced by ExecutionCapability<'HOLD'>
    };
  }

  // ALLOW verdict - execution capability exists
  // Type system enforces: execute property MUST exist
  const proofPath = await logOpenClawDecision({
    input: decisionInput,
    decision,
    intercepted: false,
    source: 'openclaw_mock',
  });

  return {
    verdict: 'ALLOW',
    proof_path: proofPath,
    decision_hash: decision.decision_hash,
    reason: decision.reason || 'Execution allowed',
    executed: false,
    // execute function EXISTS - enforced by ExecutionCapability<'ALLOW'>
    execute: async () => {
      // Mock execution implementation
      // In production, this would invoke actual OpenClaw tool execution
      return {
        success: true,
        result: { tool_name: payload.tool_name, status: 'executed' },
      };
    },
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
