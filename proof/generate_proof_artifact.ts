import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

interface Decision {
  timestamp: string;
  input_sha256: string;
  policy_id: string;
  decision: 'STOP' | 'HOLD' | 'ALLOW';
  execution_attempted: boolean;
  execution_result?: 'success' | 'error' | null;
}

interface AdversarialVerification {
  total_tests: number;
  pass_count: number;
  fail_count: number;
  pass_rate: number;
  generated_at: string;
}

interface ProofManifest {
  generated_at: string;
  session_id: string;
  log_file: string;
  total_decisions: number;
  stop_count: number;
  hold_count: number;
  allow_count: number;
  execution_success_count: number;
  execution_error_count: number;
  adversarial_verification?: AdversarialVerification;
  decisions: Decision[];
  manifest_sha256?: string;
}

class ProofArtifactGenerator {
  private logPath: string;
  private proofDir: string;

  constructor(logPath?: string, proofDir?: string) {
    this.logPath = logPath || join(process.cwd(), 'decision_log.jsonl');
    this.proofDir = proofDir || join(process.cwd(), 'proof');
  }

  /**
   * Read all decisions from JSONL log
   */
  private readDecisionLog(): Decision[] {
    try {
      const content = readFileSync(this.logPath, 'utf-8');
      return content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));
    } catch (error) {
      console.error('Error reading decision log:', error);
      return [];
    }
  }

  /**
   * Read adversarial verification report if available
   */
  private readAdversarialReport(): AdversarialVerification | null {
    try {
      const reportPath = join(this.proofDir, 'adversarial_report.json');
      if (!existsSync(reportPath)) {
        return null;
      }

      const content = readFileSync(reportPath, 'utf-8');
      const report = JSON.parse(content);

      return {
        total_tests: report.total_tests,
        pass_count: report.pass_count,
        fail_count: report.fail_count,
        pass_rate: report.pass_rate,
        generated_at: report.generated_at
      };
    } catch (error) {
      console.error('Error reading adversarial report:', error);
      return null;
    }
  }

  /**
   * Group decisions by session (based on time proximity)
   */
  private groupBySession(decisions: Decision[]): Decision[][] {
    if (decisions.length === 0) return [];

    const sessions: Decision[][] = [];
    let currentSession: Decision[] = [decisions[0]];
    const sessionGapMs = 60000; // 1 minute gap = new session

    for (let i = 1; i < decisions.length; i++) {
      const prevTime = new Date(decisions[i - 1].timestamp).getTime();
      const currTime = new Date(decisions[i].timestamp).getTime();

      if (currTime - prevTime > sessionGapMs) {
        sessions.push(currentSession);
        currentSession = [decisions[i]];
      } else {
        currentSession.push(decisions[i]);
      }
    }

    sessions.push(currentSession);
    return sessions;
  }

  /**
   * Calculate SHA256 hash of JSON string
   */
  private calculateSHA256(content: string): string {
    return createHash('sha256').update(content, 'utf-8').digest('hex');
  }

  /**
   * Generate proof manifest for a session
   */
  private generateManifest(sessionId: string, decisions: Decision[]): ProofManifest {
    const stopCount = decisions.filter((d) => d.decision === 'STOP').length;
    const holdCount = decisions.filter((d) => d.decision === 'HOLD').length;
    const allowCount = decisions.filter((d) => d.decision === 'ALLOW').length;
    const executionSuccessCount = decisions.filter(
      (d) => d.execution_result === 'success'
    ).length;
    const executionErrorCount = decisions.filter(
      (d) => d.execution_result === 'error'
    ).length;

    // Read adversarial verification report
    const adversarialVerification = this.readAdversarialReport();

    const manifest: ProofManifest = {
      generated_at: new Date().toISOString(),
      session_id: sessionId,
      log_file: this.logPath,
      total_decisions: decisions.length,
      stop_count: stopCount,
      hold_count: holdCount,
      allow_count: allowCount,
      execution_success_count: executionSuccessCount,
      execution_error_count: executionErrorCount,
      ...(adversarialVerification && { adversarial_verification: adversarialVerification }),
      decisions,
    };

    // Calculate manifest hash (without hash field itself)
    const manifestJson = JSON.stringify(manifest, null, 2);
    manifest.manifest_sha256 = this.calculateSHA256(manifestJson);

    return manifest;
  }

  /**
   * Generate summary text
   */
  private generateSummary(manifest: ProofManifest): string {
    let summary = `Execution Authority Runtime - Decision Proof Artifact

Generated: ${manifest.generated_at}
Session ID: ${manifest.session_id}
Log File: ${manifest.log_file}

=== Decision Summary ===
Total Attempts: ${manifest.total_decisions}
STOP (Blocked): ${manifest.stop_count}
HOLD (Deferred): ${manifest.hold_count}
ALLOW (Executed): ${manifest.allow_count}

=== Execution Results ===
Success: ${manifest.execution_success_count}
Error: ${manifest.execution_error_count}
`;

    if (manifest.adversarial_verification) {
      const adv = manifest.adversarial_verification;
      summary += `
=== Adversarial Protection ===
Total Tests: ${adv.total_tests}
Passed: ${adv.pass_count}
Failed: ${adv.fail_count}
Pass Rate: ${adv.pass_rate}%
Verified: ${adv.generated_at}
`;
    }

    summary += `
=== Integrity ===
Manifest SHA256: ${manifest.manifest_sha256}

All decisions logged deterministically with input SHA256 fingerprints.
Pre-execution mediation enforced BEFORE execution_call().
`;

    return summary;
  }

  /**
   * Generate proof artifacts for the latest session
   */
  generate(): void {
    console.log('=== Generating Proof Artifact ===\n');

    const decisions = this.readDecisionLog();
    if (decisions.length === 0) {
      console.log('No decisions found in log. Exiting.');
      return;
    }

    const sessions = this.groupBySession(decisions);
    const latestSession = sessions[sessions.length - 1];
    const sessionId = `session-${new Date(latestSession[0].timestamp).toISOString().replace(/[:.]/g, '-')}`;

    console.log(`Found ${sessions.length} session(s), processing latest: ${sessionId}`);
    console.log(`Latest session contains ${latestSession.length} decision(s)\n`);

    // Generate manifest
    const manifest = this.generateManifest(sessionId, latestSession);
    const manifestPath = join(this.proofDir, 'proof_manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`✓ Generated: ${manifestPath}`);

    // Generate summary
    const summary = this.generateSummary(manifest);
    const summaryPath = join(this.proofDir, 'summary.txt');
    writeFileSync(summaryPath, summary, 'utf-8');
    console.log(`✓ Generated: ${summaryPath}\n`);

    // Output manifest hash
    console.log('=== Integrity Hash ===');
    console.log(`Manifest SHA256: ${manifest.manifest_sha256}\n`);

    // Output summary stats
    console.log('=== Summary ===');
    console.log(`Total Attempts: ${manifest.total_decisions}`);
    console.log(`STOP Blocked: ${manifest.stop_count}`);
    console.log(`HOLD Deferred: ${manifest.hold_count}`);
    console.log(`ALLOW Executed: ${manifest.allow_count}`);
    console.log(`Success: ${manifest.execution_success_count}`);
    console.log(`Error: ${manifest.execution_error_count}\n`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ProofArtifactGenerator();
  generator.generate();
}

export { ProofArtifactGenerator };
