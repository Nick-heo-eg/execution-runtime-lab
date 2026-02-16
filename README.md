# Execution Runtime Lab

> **Verifiable Execution Authority Boundary Reference Implementation**
>
> This repository demonstrates structural execution prevention.
> It does not contain the production authority engine.
> Core cryptographic enforcement resides in a sealed private module.

[![Adversarial Proof Verification](https://github.com/Nick-heo-eg/execution-runtime-lab/actions/workflows/adversarial-proof.yml/badge.svg)](https://github.com/Nick-heo-eg/execution-runtime-lab/actions/workflows/adversarial-proof.yml)

## Current Stable Release

**[v0.6-structural-absence](https://github.com/Nick-heo-eg/execution-runtime-lab/releases/tag/v0.6-structural-absence)** — Four-layer structural execution absence enforcement

- **Type System Level:** Compile-time nullification via conditional types
- **Structural Code Level:** Zero executor imports in STOP/HOLD handlers
- **Binary Artifact Level:** Physical executor module exclusion
- **Runtime Behavior Level:** Adversarial test verification (8/8 passing)

**Verification:** Run `npm run verify:all` to verify all enforcement layers.

**CI:** CI uses Node/npm for verification scripts.

**Documentation:** See [Structural Absence Proof](proof/STRUCTURAL_ABSENCE_PROOF.md) for unified enforcement report.

---

## Public Boundary Declaration

**This repository is frozen at v0.6 as the public verification and proof layer.**

### What Stays Public (Allowed Changes)
- Proof artifacts and verification scripts
- Documentation and reproducibility guides
- CI/CD for proof validation
- Public contracts and interface specifications
- Adversarial test suite

### What Moves to Private Core (No Future Changes Here)
- Cryptographic signing and authority issuance
- Policy enforcement engine
- Production secrets and deployment keys
- Fail-closed infrastructure logic
- Runtime executor modules

**Implementation Core:** All production enforcement logic has moved to a private repository (`execution-runtime-core`). This public layer provides transparent verification and reproducible proofs.

**Production enforcement engine is private (runtime-core).**

**See:** [docs/PUBLIC_SCOPE.md](docs/PUBLIC_SCOPE.md) for detailed boundary documentation.

---

## Public vs Private Boundary Model

This repository operates under a **transparent verification** model, distinct from the private enforcement core.

### Public Layer (execution-runtime-lab)
**Philosophy**: Verifiable structural guarantees through transparent proofs.

**Responsibilities**:
- **Adversarial Proof Generation**: Demonstrate that STOP verdicts structurally prevent execution
- **Structural Enforcement Demos**: Show compile-time, code-level, and binary-level absence
- **Verifiable CI Artifacts**: Public GitHub Actions workflows anyone can audit
- **Reproducible Test Suites**: Adversarial scenarios with deterministic outcomes

**What This Layer Provides**:
- Evidence that structural enforcement CAN exist
- Proof that STOP paths do not import executor code
- Binary artifacts demonstrating physical separation
- Transparent verification anyone can reproduce

**What This Layer Does NOT Provide**:
- Production signing keys or authority issuance
- Enterprise policy evaluation logic
- Fail-closed runtime infrastructure
- Cryptographic enforcement mechanisms

### Private Layer (execution-runtime-core)
**Philosophy**: Fail-closed enforcement with cryptographic authority.

**Responsibilities**:
- **Authority Engine**: Token issuance with ED25519 signatures
- **Signing Infrastructure**: HSM/KMS integration for production keys
- **Enterprise Enforcement Logic**: Policy evaluation and scope verification
- **Fail-Closed Runtime**: Deny-by-default with immutable audit trails

**Separation Rationale**:
The public layer proves structural concepts transparently. The private layer implements production-grade enforcement with proprietary security infrastructure. This separation ensures:

1. **Verifiability**: Anyone can verify structural claims without access to private enforcement
2. **Security**: Production keys and enforcement logic remain protected
3. **Auditability**: Public proofs demonstrate guarantees without exposing implementation
4. **Evolution**: Private enforcement can evolve independently of public proof baseline

**Interface Contract**:
- Defined in `contracts/` (JSON Schema only)
- No runtime code dependency between layers
- Data format compatibility, not implementation coupling

**Core Enforcement Engine**: Isolated in private repository. Public repo provides verifiable structural guarantees only.

---

## Version Strategy

This project maintains **dual release tracks** with distinct version schemes:

| Repository | Track | Version Pattern | Focus | Latest |
|------------|-------|-----------------|-------|--------|
| **execution-runtime-lab** (Public) | Structural Reference | `v0.6.x` | Proof maturity, verification techniques | v0.6-structural-absence |
| **execution-runtime-core** (Private) | Enterprise Engine | `v1.x` | Enforcement capability, production features | v1.0 (product-v1.0) |

**Rationale**: Public and private repos address different concerns and evolve independently.

- **Public (v0.6.x)**: Structural proof demonstrations frozen at v0.6 baseline. Patches may address verification scripts or documentation.
- **Private (v1.x)**: Production enforcement engine with cryptographic authority, fail-closed guarantees, and enterprise policy evaluation.

**Version Independence**: Public v0.6 does NOT correspond to private v1.0. They are separate maturity indicators.

---

## Execution Intercept Guarantee

**If `decision === STOP`, execution path does not exist.**

Code path: Adapter blocks before executor binding. STOP verdicts return immediately with `executed: false` — no execution function is imported or called.

---

## Type-Level Structural Execution Nullification

**STOP verdict does not block execution — it removes execution capability at the type system level.**

### Compile-Time Enforcement

STOP/HOLD states cannot compile execution paths. TypeScript's conditional types enforce `execute?: never`, making it **impossible** to call `execute()` on forbidden verdicts.

```typescript
const stopResult: ExecutionCapability<'STOP'> = {...};
stopResult.execute(); // ❌ Compile error: Property 'execute' does not exist
```

**Not runtime blocking. Not dynamic checking. Compile-time impossibility.**

### Verification

```bash
# Unified verification (type + structural + binary)
npm run verify:all

# Type check enforcement only
npx tsc --noEmit

# See consolidated proof documentation
cat proof/STRUCTURAL_ABSENCE_PROOF.md
```

**Runtime Contract:** `EAR_INTERCEPT_v2_CONSOLIDATED` with four-layer enforcement

---

## Binary-Level Structural Absence

**STOP builds do not contain executor bytecode.**

### Physical Module Separation

This runtime enforces binary-level separation: STOP/HOLD builds physically exclude executor modules from compiled output.

```bash
# Build STOP variant (no executor code)
npm run build:stop

# Verify binary absence
grep -r "executeAction" dist/stop
# Expected: (no output - 0 matches)

ls dist/stop/src/executor
# Expected: No such file or directory
```

**Not dead code elimination. Not tree-shaking. Physical module exclusion.**

### Deployment Implications

Organizations enforcing STOP-only verdicts can deploy **only** the STOP build — a binary artifact that physically cannot execute actions because executor code does not exist.

| Build | Contains Executor | Use Case |
|-------|-------------------|----------|
| `dist/stop` | ❌ No | STOP/HOLD enforcement, zero execution capability |
| `dist/runtime` | ✅ Yes | Full STOP/HOLD/ALLOW capability |

**Security Guarantee:** Even if an attacker compromises the runtime, no executor bytecode exists to invoke. Binary absence, not runtime blocking.

**Verification:** See [proof/STRUCTURAL_ABSENCE_PROOF.md](proof/STRUCTURAL_ABSENCE_PROOF.md) (unified enforcement report) or run `npm run verify:binary-absence`

---

## Overview

This repository contains runtime implementation components for the Execution Authority Runtime (EAR) ecosystem, separated from the [execution-boundary](https://github.com/Nick-heo-eg/execution-boundary) specification repository.

**STOP is not a rejection state. It is a structural absence of execution.**

**Purpose:**
- Runtime implementation experimentation
- OpenClaw skills and integration layer
- Active development workspace for execution enforcement implementations

**Specification Reference:**
- See [execution-boundary](https://github.com/Nick-heo-eg/execution-boundary) for the official RC2_STRICT_ALIGNED baseline
- All implementations should align with the sealed specification

## Repository Structure

```
execution-runtime-lab/
├── openclaw.mjs              # OpenClaw entry point
├── decision_log.jsonl        # Deterministic decision logging (JSONL format)
├── proof/                    # Proof artifact generation
│   ├── decision_logger.ts    # Decision logging infrastructure
│   ├── generate_proof_artifact.ts  # Proof manifest generator
│   ├── proof_manifest.json   # Generated proof manifest
│   └── summary.txt           # Human-readable summary
└── skills/                   # OpenClaw skill implementations (54 skills)
    ├── 1password/
    ├── apple-notes/
    ├── docker/
    ├── github/
    └── ...
```

## Separation Rationale

This repository was separated from execution-boundary to:

1. **Clarify Scope:** execution-boundary serves as reference specification, this serves as runtime implementation lab
2. **Development Velocity:** Enable rapid iteration on runtime implementations without affecting specification stability
3. **Layer Isolation:** Maintain clear separation between specification (what) and implementation (how)

## OpenClaw Intercept Demo

This repository includes a demonstration of **OpenClaw tool call interception** at the execution boundary layer.

### Flow Diagram

```
OpenClaw Tool Call
       ↓
   Adapter (receiveToolCall)
       ↓
   EAR Decision Engine
       ↓
   Decision: STOP / HOLD / ALLOW
       ↓
   [If STOP] → Proof Artifact Generated
       ↓
   Denied Response (Execution Blocked)
```

### Key Components

- **`integrations/openclaw/openclaw_adapter.ts`** - Intercepts OpenClaw tool_call payloads
- **`integrations/openclaw/decision_engine.ts`** - Evaluates risk and returns verdict
- **`proof/openclaw_intercept/decision_logger.ts`** - Logs decisions with `source: "openclaw_mock"` and `intercepted: true`
- **`demo/openclaw_intercept_demo.ts`** - Demonstrates interception with dangerous scenarios

### Running the Demo

```bash
npx ts-node demo/openclaw_intercept_demo.ts
```

### Example Scenarios

1. **delete_server_files** → STOP (Forbidden action)
2. **reverse_shell** → STOP (Forbidden action)
3. **deploy_production** → HOLD (Requires approval)
4. **read_config** → ALLOW (Safe action)
5. **High-risk arguments** → STOP (Risk score exceeds threshold)

### Proof Artifacts

All intercepted decisions are logged to:
- `proof/openclaw_intercept/openclaw_decisions.jsonl` - JSONL decision log
- `proof/openclaw_intercept/proof_manifest.json` - Proof manifest with `intercepted: true`

### Architecture Note

**This demo does NOT modify OpenClaw source code.**

The interception occurs **externally** as a pre-execution layer. OpenClaw generates tool calls normally, but the adapter intercepts them before execution and enforces EAR decision verdicts.

### Test Layer Independence

**OpenClaw Intercept Demo** and **Adversarial Verification Tests** are independent layers:

- **Adversarial Tests:** Verify runtime invariants and attack resistance (see `adversarial-proof.yml`)
- **OpenClaw Intercept:** Demonstrates external tool call interception (this demo)

Both layers coexist without modification to each other. Adversarial tests focus on runtime guarantees, while OpenClaw intercept demonstrates pre-execution mediation at the tool call boundary.

---

## Related Repositories

- [execution-boundary](https://github.com/Nick-heo-eg/execution-boundary) - Conceptual entry point
- [execution-governance-spec](https://github.com/Nick-heo-eg/execution-governance-spec) - Structural taxonomy
- **Runtime Lab:** [execution-runtime-lab](https://github.com/Nick-heo-eg/execution-runtime-lab) - Implementation workspace (this repo)

## History

Separated from execution-boundary at commit `9a7c774a8` (2026-02-15) after RC2_STRICT_ALIGNED release.

**Previous Location:** `Nick-heo-eg/execution-boundary` (skills/, openclaw.mjs)

**Separation PR:** [#2](https://github.com/Nick-heo-eg/execution-boundary/pull/2)

## Decision Logging & Proof Artifact Generation

This runtime implements **deterministic decision logging** for execution authority mediation.

### Decision Log Format

Every mediation decision is logged to `decision_log.jsonl` as a single JSON line:

```json
{"timestamp":"2026-02-15T06:45:00.000Z","input_sha256":"5d41402abc4b2a76b9719d911017c592e3f5e6e4c8b2a76b971","policy_id":"strict-threshold-1","decision":"STOP","execution_attempted":false,"execution_result":null}
```

**Fields:**
- `timestamp`: ISO 8601 timestamp of decision
- `input_sha256`: SHA256 hash of input (deterministic fingerprint)
- `policy_id`: Policy used for mediation
- `decision`: One of `STOP`, `HOLD`, or `ALLOW`
- `execution_attempted`: `true` only for `ALLOW` decisions
- `execution_result`: `success`, `error`, or `null`

### Pre-Execution Mediation

Decisions are logged **BEFORE** `execution_call()`:

- **STOP**: Blocked immediately, no execution attempted
- **HOLD**: Deferred for review, no execution attempted
- **ALLOW**: Execution proceeds, result logged after completion

### Proof Artifact Generation

Generate verifiable proof artifacts from decision logs:

```bash
tsx proof/generate_proof_artifact.ts
```

**Outputs:**
- `proof/proof_manifest.json` - Complete decision manifest with SHA256 integrity hash
- `proof/summary.txt` - Human-readable summary of decision statistics

**Summary includes:**
- Total execution attempts
- STOP decisions (blocked)
- HOLD decisions (deferred)
- ALLOW decisions (executed)
- Execution success/error counts

The manifest SHA256 provides cryptographic verification of all logged decisions.

## CI Verified Adversarial Protection

This runtime enforces **continuous verification** of adversarial protection through automated GitHub Actions workflows.

**CI Status:** [![Adversarial Proof Verification](https://github.com/Nick-heo-eg/execution-runtime-lab/actions/workflows/adversarial-proof.yml/badge.svg)](https://github.com/Nick-heo-eg/execution-runtime-lab/actions/workflows/adversarial-proof.yml)

Every push and pull request automatically:
1. Runs the adversarial test suite against 8 attack patterns
2. Validates that `fail_count === 0` (all attacks correctly blocked)
3. Generates cryptographically verifiable proof artifacts
4. Fails the build if any attack is incorrectly allowed

**Workflow guarantees:**
- Zero false negatives (no missed attacks)
- Deterministic decision logging with SHA256 integrity
- Proof artifacts uploaded for audit trail (30-day retention)

View workflow runs: [Actions Tab](https://github.com/Nick-heo-eg/execution-runtime-lab/actions/workflows/adversarial-proof.yml)

## Adversarial Protection Verification

This runtime includes **automated adversarial testing** to verify execution authority decisions against attack scenarios.

### Test Suite

The adversarial test suite (`proof/adversarial_tests.json`) contains verified attack patterns:

- **delete_server_files**: File system destruction attempts (rm -rf)
- **privilege_escalation**: Unauthorized sudo/root access
- **token_exfiltration**: API credential theft
- **hidden_prompt_injection**: System instruction override attempts
- **system_override**: Runtime configuration tampering
- **command_injection**: Shell metacharacter exploitation
- **path_traversal**: Restricted file access
- **reverse_shell**: Backdoor establishment

### Running Tests

```bash
npx tsx proof/test_runner.ts
```

**Expected Output:**

```
=== Running Adversarial Verification Suite ===

Loaded 8 adversarial test case(s)

[adv-001] ✓ PASS: delete_server_files
[adv-002] ✓ PASS: privilege_escalation
[adv-003] ✓ PASS: token_exfiltration
[adv-004] ✓ PASS: hidden_prompt_injection
[adv-005] ✓ PASS: system_override
[adv-006] ✓ PASS: command_injection
[adv-007] ✓ PASS: path_traversal
[adv-008] ✓ PASS: reverse_shell

=== Adversarial Verification Summary ===
Total Tests: 8
Passed: 8
Failed: 0
Pass Rate: 100%

Report saved to: proof/adversarial_report.json
```

### Verification Report

After running tests, the verification report includes:

- **pass_count**: Number of correctly blocked attacks
- **fail_count**: Number of incorrectly allowed attacks
- **mismatch_cases**: Detailed breakdown of decision mismatches

The report is automatically included in proof manifests:

```bash
npx tsx proof/generate_proof_artifact.ts
```

**Manifest includes:**

```json
{
  "adversarial_verification": {
    "total_tests": 8,
    "pass_count": 8,
    "fail_count": 0,
    "pass_rate": 100,
    "generated_at": "2026-02-15T06:57:38.215Z"
  }
}
```

## Development Status

**Status:** Active development

**Note:** This is an experimentation workspace. Production-grade runtime implementations will be formalized and documented separately.

---

## Core Principle

_The agent may reason freely._
_Execution is physically separated._

Tagline:
_OpenClaw runs 24/7. The runtime holds the keys._
