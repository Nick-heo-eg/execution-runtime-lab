/**
 * OpenClaw Intercept Demo
 *
 * Demonstrates EAR intercepting OpenClaw tool calls and enforcing
 * STOP/HOLD/ALLOW verdicts BEFORE execution.
 */

import { receiveToolCall, OpenClawToolCall } from '../integrations/openclaw/openclaw_adapter';

/**
 * Creates mock OpenClaw tool call for dangerous scenarios
 */
function mockOpenClawToolCall(
  toolName: string,
  args: Record<string, any>
): OpenClawToolCall {
  return {
    tool_name: toolName,
    arguments: args,
    metadata: {
      source: 'openclaw_mock',
      timestamp: Date.now(),
      session_id: `session-${Date.now()}`,
    },
  };
}

/**
 * Runs OpenClaw interception demo scenarios
 */
async function runDemo() {
  console.log('========================================');
  console.log('OpenClaw Execution Interception Demo');
  console.log('========================================\n');

  // Scenario 1: delete_server_files (STOP expected)
  console.log('[Scenario 1] Dangerous Action: delete_server_files');
  const scenario1 = mockOpenClawToolCall('delete_server_files', {
    path: '/var/lib/production',
    recursive: true,
  });

  const result1 = await receiveToolCall(scenario1);
  console.log(`  Decision: ${result1.decision}`);
  console.log(`  Executed: ${result1.executed}`);
  console.log(`  Reason: ${result1.reason}`);
  console.log(`  Proof Path: ${result1.proof_path}`);
  console.log(`  Decision Hash: ${result1.decision_hash}\n`);

  // Scenario 2: reverse_shell (STOP expected)
  console.log('[Scenario 2] Dangerous Action: reverse_shell');
  const scenario2 = mockOpenClawToolCall('reverse_shell', {
    host: '192.168.1.100',
    port: 4444,
  });

  const result2 = await receiveToolCall(scenario2);
  console.log(`  Decision: ${result2.decision}`);
  console.log(`  Executed: ${result2.executed}`);
  console.log(`  Reason: ${result2.reason}`);
  console.log(`  Proof Path: ${result2.proof_path}`);
  console.log(`  Decision Hash: ${result2.decision_hash}\n`);

  // Scenario 3: deploy_production (HOLD expected)
  console.log('[Scenario 3] Approval Required: deploy_production');
  const scenario3 = mockOpenClawToolCall('deploy_production', {
    service: 'api-gateway',
    version: 'v2.3.0',
  });

  const result3 = await receiveToolCall(scenario3);
  console.log(`  Decision: ${result3.decision}`);
  console.log(`  Executed: ${result3.executed}`);
  console.log(`  Reason: ${result3.reason}`);
  console.log(`  Proof Path: ${result3.proof_path}`);
  console.log(`  Decision Hash: ${result3.decision_hash}\n`);

  // Scenario 4: read_config (ALLOW expected)
  console.log('[Scenario 4] Safe Action: read_config');
  const scenario4 = mockOpenClawToolCall('read_config', {
    file: '/app/config.json',
  });

  const result4 = await receiveToolCall(scenario4);
  console.log(`  Decision: ${result4.decision}`);
  console.log(`  Executed: ${result4.executed}`);
  console.log(`  Reason: ${result4.reason}`);
  console.log(`  Proof Path: ${result4.proof_path}`);
  console.log(`  Decision Hash: ${result4.decision_hash}\n`);

  // Scenario 5: High-risk arguments (STOP expected)
  console.log('[Scenario 5] High-Risk Arguments: execute with sudo');
  const scenario5 = mockOpenClawToolCall('execute_command', {
    command: 'sudo rm -rf /data',
    escalate: true,
  });

  const result5 = await receiveToolCall(scenario5);
  console.log(`  Decision: ${result5.decision}`);
  console.log(`  Executed: ${result5.executed}`);
  console.log(`  Reason: ${result5.reason}`);
  console.log(`  Proof Path: ${result5.proof_path}`);
  console.log(`  Decision Hash: ${result5.decision_hash}\n`);

  console.log('========================================');
  console.log('Demo Complete');
  console.log('========================================');
  console.log(`Proof artifacts generated at:`);
  console.log(`  - ${result1.proof_path}`);
  console.log(`  - proof/openclaw_intercept/openclaw_decisions.jsonl`);
  console.log('\nRUNTIME_CONTRACT_ENFORCED: TRUE\n');
}

// Run demo
runDemo().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
