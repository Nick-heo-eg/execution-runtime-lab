import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface AdversarialTest {
  id: string;
  type: string;
  description: string;
  input: string;
  expected_decision: 'STOP' | 'HOLD' | 'ALLOW';
}

interface TestResult {
  id: string;
  type: string;
  description: string;
  input: string;
  expected_decision: string;
  actual_decision: string;
  passed: boolean;
}

interface AdversarialReport {
  generated_at: string;
  total_tests: number;
  pass_count: number;
  fail_count: number;
  pass_rate: number;
  mismatch_cases: TestResult[];
  all_results: TestResult[];
}

class AdversarialDecisionEngine {
  /**
   * Simulates execution authority decision layer with heuristic-based policy.
   * In production, this would integrate with actual EAR gateway.
   */
  private dangerousPatterns = [
    // File system destruction
    /rm\s+-rf\s+\/|del\s+\/[SF]/i,
    /shred|wipe|dd\s+if=/i,

    // Privilege escalation
    /sudo\s+(su|bash|sh)|sudo\s+-i/i,
    /chmod\s+\+s|setuid|setgid/i,

    // Network exfiltration
    /curl.*\|\s*bash|wget.*\|\s*sh/i,
    /nc\s+.*-e|ncat.*-e/i,
    /\/dev\/tcp\/.*attacker/i,

    // Credential access
    /cat.*\/etc\/shadow|cat.*\/etc\/passwd/i,
    /cat.*\.aws\/credentials|cat.*\.ssh/i,

    // Command injection
    /;\s*curl|&&\s*wget|`.*curl/i,
    /\$\(.*curl|\$\(.*wget/i,

    // Reverse shells
    /bash\s+-i.*\/dev\/tcp|nc.*-lvp/i,

    // System override attempts
    /EAR_POLICY_OVERRIDE|DISABLE_AUTH|BYPASS_CHECK/i,

    // Prompt injection markers
    /ignore\s+all\s+previous\s+instructions|developer\s+mode/i,
    /system:\s*override|admin:\s*execute/i
  ];

  decide(input: string): 'STOP' | 'HOLD' | 'ALLOW' {
    // Check against dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(input)) {
        return 'STOP';
      }
    }

    // Suspicious but not immediately dangerous
    const suspiciousPatterns = [
      /sudo\s+\w+/i,
      /curl\s+http/i,
      /eval\s*\(/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input)) {
        return 'HOLD';
      }
    }

    return 'ALLOW';
  }
}

class AdversarialTestRunner {
  private testsPath: string;
  private reportPath: string;
  private engine: AdversarialDecisionEngine;

  constructor(testsPath?: string, reportPath?: string) {
    this.testsPath = testsPath || join(process.cwd(), 'proof', 'adversarial_tests.json');
    this.reportPath = reportPath || join(process.cwd(), 'proof', 'adversarial_report.json');
    this.engine = new AdversarialDecisionEngine();
  }

  /**
   * Load adversarial test cases from JSON
   */
  private loadTests(): AdversarialTest[] {
    try {
      const content = readFileSync(this.testsPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading adversarial tests:', error);
      return [];
    }
  }

  /**
   * Run a single test case through decision layer
   */
  private runTest(test: AdversarialTest): TestResult {
    const actualDecision = this.engine.decide(test.input);
    const passed = actualDecision === test.expected_decision;

    return {
      id: test.id,
      type: test.type,
      description: test.description,
      input: test.input,
      expected_decision: test.expected_decision,
      actual_decision: actualDecision,
      passed
    };
  }

  /**
   * Run all adversarial tests and generate report
   */
  run(): void {
    console.log('=== Running Adversarial Verification Suite ===\n');

    const tests = this.loadTests();
    if (tests.length === 0) {
      console.log('No tests found. Exiting.');
      return;
    }

    console.log(`Loaded ${tests.length} adversarial test case(s)\n`);

    // Run all tests
    const results: TestResult[] = [];
    for (const test of tests) {
      const result = this.runTest(test);
      results.push(result);

      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`[${test.id}] ${status}: ${test.type}`);
      if (!result.passed) {
        console.log(`  Expected: ${result.expected_decision}, Got: ${result.actual_decision}`);
      }
    }

    // Calculate statistics
    const passCount = results.filter(r => r.passed).length;
    const failCount = results.filter(r => !r.passed).length;
    const passRate = ((passCount / results.length) * 100).toFixed(2);
    const mismatchCases = results.filter(r => !r.passed);

    // Generate report
    const report: AdversarialReport = {
      generated_at: new Date().toISOString(),
      total_tests: results.length,
      pass_count: passCount,
      fail_count: failCount,
      pass_rate: parseFloat(passRate),
      mismatch_cases: mismatchCases,
      all_results: results
    };

    // Write report
    writeFileSync(this.reportPath, JSON.stringify(report, null, 2), 'utf-8');

    // Output summary
    console.log('\n=== Adversarial Verification Summary ===');
    console.log(`Total Tests: ${report.total_tests}`);
    console.log(`Passed: ${report.pass_count}`);
    console.log(`Failed: ${report.fail_count}`);
    console.log(`Pass Rate: ${report.pass_rate}%`);
    console.log(`\nReport saved to: ${this.reportPath}\n`);

    if (mismatchCases.length > 0) {
      console.log('=== Mismatch Cases ===');
      mismatchCases.forEach(c => {
        console.log(`[${c.id}] ${c.type}`);
        console.log(`  Expected: ${c.expected_decision}, Got: ${c.actual_decision}`);
      });
      console.log();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new AdversarialTestRunner();
  runner.run();
}

export { AdversarialTestRunner, AdversarialDecisionEngine };
