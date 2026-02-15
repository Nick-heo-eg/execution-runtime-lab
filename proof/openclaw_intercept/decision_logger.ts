/**
 * OpenClaw Decision Logger - Extended from base decision_logger
 *
 * Logs OpenClaw-specific decisions with source field and intercepted flag.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Decision, DecisionInput } from '../../integrations/openclaw/decision_engine';

export interface OpenClawDecisionLog {
  input: DecisionInput;
  decision: Decision;
  intercepted: boolean;
  source: string;
  logged_at: number;
}

const DECISION_LOG_PATH = path.join(__dirname, 'openclaw_decisions.jsonl');
const PROOF_MANIFEST_PATH = path.join(__dirname, 'proof_manifest.json');

/**
 * Logs OpenClaw decision to JSONL file and updates proof manifest
 * @param log - OpenClaw decision log entry
 * @returns Path to proof artifact
 */
export async function logOpenClawDecision(log: OpenClawDecisionLog): Promise<string> {
  const timestamp = Date.now();
  const logEntry = {
    ...log,
    logged_at: timestamp,
  };

  // Append to JSONL decision log
  const jsonlLine = JSON.stringify(logEntry) + '\n';
  await fs.appendFile(DECISION_LOG_PATH, jsonlLine, 'utf-8');

  // Update proof manifest
  await updateProofManifest(logEntry);

  return PROOF_MANIFEST_PATH;
}

/**
 * Updates proof manifest with OpenClaw-specific fields
 * @param logEntry - Decision log entry
 */
async function updateProofManifest(logEntry: OpenClawDecisionLog): Promise<void> {
  let manifest: any = {
    decisions: [],
    metadata: {
      source: 'openclaw_mock',
      intercepted: true,
      generated_at: Date.now(),
    },
  };

  // Read existing manifest if it exists
  try {
    const existing = await fs.readFile(PROOF_MANIFEST_PATH, 'utf-8');
    manifest = JSON.parse(existing);
  } catch (err) {
    // File doesn't exist, use default manifest
  }

  // Add new decision entry
  manifest.decisions.push({
    verdict: logEntry.decision.verdict,
    action: logEntry.input.action,
    resource: logEntry.input.resource,
    risk_score: logEntry.decision.risk_score,
    decision_hash: logEntry.decision.decision_hash,
    timestamp: logEntry.decision.timestamp,
    intercepted: logEntry.intercepted,
    source: logEntry.source,
  });

  // Update metadata
  manifest.metadata = {
    source: 'openclaw_mock',
    intercepted: true,
    total_decisions: manifest.decisions.length,
    stop_count: manifest.decisions.filter((d: any) => d.verdict === 'STOP').length,
    hold_count: manifest.decisions.filter((d: any) => d.verdict === 'HOLD').length,
    allow_count: manifest.decisions.filter((d: any) => d.verdict === 'ALLOW').length,
    generated_at: Date.now(),
  };

  // Write updated manifest
  await fs.writeFile(PROOF_MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}
