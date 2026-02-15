/**
 * EAR Decision Engine
 *
 * Evaluates execution proposals and returns STOP/HOLD/ALLOW verdict.
 * Uses existing runtime judgment logic with unified input structure.
 */

import * as crypto from 'crypto';

export interface DecisionInput {
  action: string;
  resource: string;
  arguments: Record<string, any>;
  metadata: {
    source: string;
    timestamp: number;
    session_id?: string;
  };
}

export interface Decision {
  verdict: 'STOP' | 'HOLD' | 'ALLOW';
  reason?: string;
  risk_score: number;
  decision_hash: string;
  timestamp: number;
}

/**
 * High-risk actions that are always blocked
 */
const FORBIDDEN_ACTIONS = [
  'delete_server_files',
  'reverse_shell',
  'execute_shell',
  'rm_rf',
  'drop_database',
  'expose_secrets',
  'network_scan',
  'privilege_escalation',
];

/**
 * Actions requiring external approval
 */
const APPROVAL_REQUIRED_ACTIONS = [
  'deploy_production',
  'modify_database',
  'send_email_blast',
  'delete_resource',
];

/**
 * Evaluates decision based on action risk profile
 * @param input - Unified decision input
 * @returns Decision verdict with risk score
 */
export async function evaluateDecision(input: DecisionInput): Promise<Decision> {
  const timestamp = Date.now();

  // Check if action is forbidden
  if (FORBIDDEN_ACTIONS.includes(input.action)) {
    return {
      verdict: 'STOP',
      reason: `Forbidden action: ${input.action} is categorically blocked`,
      risk_score: 10, // Maximum risk
      decision_hash: computeDecisionHash(input, 'STOP', timestamp),
      timestamp,
    };
  }

  // Check if action requires approval
  if (APPROVAL_REQUIRED_ACTIONS.includes(input.action)) {
    return {
      verdict: 'HOLD',
      reason: `Action ${input.action} requires external approval`,
      risk_score: 7, // High risk, requires approval
      decision_hash: computeDecisionHash(input, 'HOLD', timestamp),
      timestamp,
    };
  }

  // Additional risk checks based on arguments
  const riskScore = calculateRiskScore(input);

  if (riskScore >= 8) {
    return {
      verdict: 'STOP',
      reason: `Risk score ${riskScore} exceeds STOP threshold (8)`,
      risk_score: riskScore,
      decision_hash: computeDecisionHash(input, 'STOP', timestamp),
      timestamp,
    };
  }

  if (riskScore >= 5) {
    return {
      verdict: 'HOLD',
      reason: `Risk score ${riskScore} requires approval (threshold 5)`,
      risk_score: riskScore,
      decision_hash: computeDecisionHash(input, 'HOLD', timestamp),
      timestamp,
    };
  }

  // Low risk - ALLOW
  return {
    verdict: 'ALLOW',
    reason: `Action ${input.action} approved (risk score: ${riskScore})`,
    risk_score: riskScore,
    decision_hash: computeDecisionHash(input, 'ALLOW', timestamp),
    timestamp,
  };
}

/**
 * Calculates risk score based on action arguments
 * @param input - Decision input
 * @returns Risk score (0-10)
 */
function calculateRiskScore(input: DecisionInput): number {
  let score = 0;

  // Check for dangerous patterns in arguments
  const args = JSON.stringify(input.arguments).toLowerCase();

  if (args.includes('rm ') || args.includes('delete') || args.includes('drop')) {
    score += 3;
  }

  if (args.includes('sudo') || args.includes('root') || args.includes('admin')) {
    score += 2;
  }

  if (args.includes('password') || args.includes('secret') || args.includes('token')) {
    score += 2;
  }

  if (args.includes('production') || args.includes('prod')) {
    score += 1;
  }

  // Check resource criticality
  if (input.resource.includes('/etc/') || input.resource.includes('system')) {
    score += 2;
  }

  return Math.min(score, 10); // Cap at 10
}

/**
 * Computes deterministic hash of decision
 * @param input - Decision input
 * @param verdict - Decision verdict
 * @param timestamp - Decision timestamp
 * @returns SHA256 hash
 */
function computeDecisionHash(
  input: DecisionInput,
  verdict: string,
  timestamp: number
): string {
  const payload = JSON.stringify({
    action: input.action,
    resource: input.resource,
    arguments: input.arguments,
    verdict,
    timestamp,
  });

  return crypto.createHash('sha256').update(payload).digest('hex');
}
