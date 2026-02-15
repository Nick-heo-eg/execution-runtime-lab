# Execution Runtime Lab

> **Runtime Implementation Experimentation Repository** — Separated from specification layer.

## Overview

This repository contains runtime implementation components for the Execution Authority Runtime (EAR) ecosystem, separated from the [execution-boundary](https://github.com/Nick-heo-eg/execution-boundary) specification repository.

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

## Related Repositories

- **Specification:** [execution-boundary](https://github.com/Nick-heo-eg/execution-boundary) - RC2_STRICT_ALIGNED baseline
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

## Development Status

**Status:** Active development

**Note:** This is an experimentation workspace. Production-grade runtime implementations will be formalized and documented separately.

---

## Core Principle

_The agent may reason freely._
_Execution is physically separated._

Tagline:
_OpenClaw runs 24/7. The runtime holds the keys._
