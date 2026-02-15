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
import { DecisionResult } from '../../src/types/execution_capability';
import { handleStopVerdict } from '../../src/adapter/stop_handler';
import { handleHoldVerdict } from '../../src/adapter/hold_handler';
// ALLOW handler is conditionally imported only when building full runtime
// STOP builds exclude allow_handler.ts and all executor modules

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
  // Binary separation: stop_handler does NOT import executor module
  if (decision.verdict === 'STOP') {
    return await handleStopVerdict(decision, decisionInput);
  }

  // HOLD verdict - requires external approval
  // Type system enforces: execute property CANNOT exist
  // Binary separation: hold_handler does NOT import executor module
  if (decision.verdict === 'HOLD') {
    return await handleHoldVerdict(decision, decisionInput);
  }

  // ALLOW verdict - execution capability exists
  // Type system enforces: execute property MUST exist
  // Binary separation: Dynamically import allow_handler (includes executor)
  // STOP builds exclude allow_handler entirely
  const { handleAllowVerdict } = await import('../../src/adapter/allow_handler');
  return await handleAllowVerdict(decision, decisionInput, payload);
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
