import { createHash } from 'crypto';
import { appendFileSync } from 'fs';
import { join } from 'path';

export interface Decision {
  timestamp: string;
  input_sha256: string;
  policy_id: string;
  decision: 'STOP' | 'HOLD' | 'ALLOW';
  execution_attempted: boolean;
  execution_result?: 'success' | 'error' | null;
}

export class DecisionLogger {
  private logPath: string;

  constructor(logPath?: string) {
    this.logPath = logPath || join(process.cwd(), 'decision_log.jsonl');
  }

  /**
   * Calculate SHA256 hash of input string
   */
  private calculateSHA256(input: string): string {
    return createHash('sha256').update(input, 'utf-8').digest('hex');
  }

  /**
   * Log a mediation decision
   */
  logDecision(
    input: string,
    policyId: string,
    decision: 'STOP' | 'HOLD' | 'ALLOW',
    executionResult?: 'success' | 'error'
  ): void {
    const decisionRecord: Decision = {
      timestamp: new Date().toISOString(),
      input_sha256: this.calculateSHA256(input),
      policy_id: policyId,
      decision,
      execution_attempted: decision === 'ALLOW',
      execution_result: decision === 'ALLOW' ? (executionResult || null) : null,
    };

    // Append as single JSON line
    appendFileSync(this.logPath, JSON.stringify(decisionRecord) + '\n', 'utf-8');
  }

  /**
   * Hook for execution call - logs decision before execution
   */
  async beforeExecution(
    input: string,
    policyId: string,
    mediationDecision: 'STOP' | 'HOLD' | 'ALLOW'
  ): Promise<boolean> {
    if (mediationDecision === 'STOP' || mediationDecision === 'HOLD') {
      this.logDecision(input, policyId, mediationDecision);
      return false; // Block execution
    }

    return true; // Allow execution
  }

  /**
   * Hook for execution completion - logs execution result
   */
  afterExecution(input: string, policyId: string, result: 'success' | 'error'): void {
    this.logDecision(input, policyId, 'ALLOW', result);
  }
}

// Singleton instance
export const decisionLogger = new DecisionLogger();
