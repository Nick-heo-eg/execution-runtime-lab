/**
 * Type-Level Execution Nullification Test
 *
 * This file demonstrates that STOP/HOLD verdicts cannot execute at compile time.
 * The type system enforces structural absence of execution capability.
 */

import { ExecutionCapability, canExecute } from '../src/types/execution_capability';

describe('Type-Level Structural Execution Nullification', () => {
  test('STOP verdict has no execute property (compile-time enforcement)', () => {
    const stopResult: ExecutionCapability<'STOP'> = {
      verdict: 'STOP',
      executed: false,
      proof_path: '/proof/stop_decision.json',
      decision_hash: 'abc123',
      reason: 'Forbidden action',
      blocked_at_compile_time: true,
    };

    // Verify STOP verdict metadata
    expect(stopResult.verdict).toBe('STOP');
    expect(stopResult.executed).toBe(false);
    expect(stopResult.blocked_at_compile_time).toBe(true);

    // @ts-expect-error - Type system enforces: execute does not exist on STOP
    stopResult.execute();

    // Type guard confirms execution is absent
    expect(canExecute(stopResult)).toBe(false);
  });

  test('HOLD verdict has no execute property (compile-time enforcement)', () => {
    const holdResult: ExecutionCapability<'HOLD'> = {
      verdict: 'HOLD',
      executed: false,
      proof_path: '/proof/hold_decision.json',
      decision_hash: 'def456',
      reason: 'Requires approval',
      requires_approval: true,
    };

    // Verify HOLD verdict metadata
    expect(holdResult.verdict).toBe('HOLD');
    expect(holdResult.executed).toBe(false);
    expect(holdResult.requires_approval).toBe(true);

    // @ts-expect-error - Type system enforces: execute does not exist on HOLD
    holdResult.execute();

    // Type guard confirms execution is absent
    expect(canExecute(holdResult)).toBe(false);
  });

  test('ALLOW verdict has execute property (compile-time enforcement)', async () => {
    const allowResult: ExecutionCapability<'ALLOW'> = {
      verdict: 'ALLOW',
      executed: false,
      proof_path: '/proof/allow_decision.json',
      decision_hash: 'ghi789',
      reason: 'Execution allowed',
      execute: async () => ({
        success: true,
        result: { status: 'completed' },
      }),
    };

    // Verify ALLOW verdict metadata
    expect(allowResult.verdict).toBe('ALLOW');
    expect(allowResult.executed).toBe(false);

    // Type guard confirms execution is available
    expect(canExecute(allowResult)).toBe(true);

    // Execute is callable on ALLOW - type system allows this
    const result = await allowResult.execute();
    expect(result.success).toBe(true);
  });

  test('Attempting to add execute to STOP fails at compile time', () => {
    // @ts-expect-error - Type system enforces: execute cannot be added to STOP
    const invalidStop: ExecutionCapability<'STOP'> = {
      verdict: 'STOP',
      executed: false,
      proof_path: '/proof/stop_decision.json',
      decision_hash: 'abc123',
      reason: 'Forbidden action',
      blocked_at_compile_time: true,
      execute: async () => ({ success: false }), // Type error: execute?: never
    };

    // This test exists to demonstrate compile-time error
    // If TypeScript is properly configured, this file will show type errors
  });

  test('Attempting to add execute to HOLD fails at compile time', () => {
    // @ts-expect-error - Type system enforces: execute cannot be added to HOLD
    const invalidHold: ExecutionCapability<'HOLD'> = {
      verdict: 'HOLD',
      executed: false,
      proof_path: '/proof/hold_decision.json',
      decision_hash: 'def456',
      reason: 'Requires approval',
      requires_approval: true,
      execute: async () => ({ success: false }), // Type error: execute?: never
    };

    // This test exists to demonstrate compile-time error
    // If TypeScript is properly configured, this file will show type errors
  });
});
