# Cross-Layer Enforcement Architecture

The Execution Authority Runtime ecosystem operates across three distinct architectural layers:

## Layer 1: Specification (Public)

**Repository:** [`execution-boundary`](https://github.com/Nick-heo-eg/execution-boundary)

**Role:** Architectural specification and baseline definition

**Key Artifacts:**
- RC2_STRICT_ALIGNED baseline (sealed specification)
- Judgment layer architecture
- Policy alignment metrics
- Integrity manifests

**Guarantees Defined:**
- Pre-execution blocking (STOP verdicts prevent `execution_call()`)
- Deterministic policy evaluation
- 100% policy alignment enforcement

**Scope:** **WHAT** enforcement must achieve, not **HOW** it is implemented.

---

## Layer 2: Public Runtime (Experimentation)

**Repository:** [`execution-runtime-lab`](https://github.com/Nick-heo-eg/execution-runtime-lab) (this repository)

**Role:** Runtime implementation experimentation and integration demonstrations

**Key Components:**
- OpenClaw skills integration (54 skills)
- Decision logging infrastructure (`decision_log.jsonl`)
- Proof artifact generation (`proof/`)
- **OpenClaw Intercept Demo** (external tool call mediation)

**Guarantees Demonstrated:**
- Pre-execution STOP enforcement
- Cryptographic proof generation per decision
- External interception (no source modification)
- Structural execution path absence when STOP

**Scope:** **HOW** enforcement can be implemented publicly, without exposing actual enforcement mechanisms.

---

## Layer 3: Private Enforcement Core

**Repository:** [`execution-runtime-core`](https://github.com/Nick-heo-eg/execution-runtime-core) (private)

**Role:** Actual enforcement engine implementation

**Key Modules:**
- **Gate** (`src/gate/authority_gate.ts`) - Fail-closed enforcement
- **Crypto** (`src/crypto/signature.ts`) - ED25519 signature verification
- **Infra** (`src/infra/environment_fingerprint.ts`) - Runtime integrity checks

**Guarantees Implemented:**
1. **Fail-Closed Enforcement** - System denies when authority unavailable
2. **Cryptographic Verification** - All execution requires valid signatures
3. **Infrastructure Bypass Prevention** - No execution outside cryptographic verification

**Scope:** **ACTUAL** enforcement mechanisms, protected in private repository.

---

## Layer Separation Rationale

### Why Three Layers?

1. **Specification Stability** (execution-boundary)
   - Public reference baseline
   - No implementation details exposed
   - Stable contract for integrators

2. **Experimentation Velocity** (execution-runtime-lab)
   - Public demonstrations of enforcement concepts
   - Integration layer for OpenClaw and other tools
   - Proof of concept implementations

3. **Enforcement Protection** (execution-runtime-core)
   - Private implementation of actual enforcement
   - Protection of cryptographic mechanisms
   - Production-grade security guarantees

### Information Flow

```
Specification Layer (Public)
    ↓ (defines contracts)
Public Runtime Layer (Experimentation)
    ↓ (demonstrates concepts)
Private Core Layer (Enforcement)
    ↓ (implements guarantees)
```

### Cross-Layer Contract Enforcement

**execution-boundary** defines:
- STOP verdicts MUST prevent execution before `execution_call()`
- Policy alignment MUST be 100%
- Decisions MUST be deterministic

**execution-runtime-lab** demonstrates:
- OpenClaw intercept STOP enforcement
- Cryptographic proof generation
- Decision logging with SHA256 hashes

**execution-runtime-core** implements:
- Fail-closed gate (`enforceFailClosed()`)
- ED25519 signature verification (`verifyED25519()`)
- Runtime integrity fingerprinting (`computeRuntimeFingerprint()`)

---

## Usage Guidance

**For Integrators:**
- Reference **execution-boundary** for specification
- Experiment with **execution-runtime-lab** for integration patterns
- Contact maintainers for **execution-runtime-core** access (private)

**For Auditors:**
- Review **execution-boundary** for architectural guarantees
- Verify **execution-runtime-lab** proof artifacts
- Request private audit access to **execution-runtime-core** enforcement logic

**For Contributors:**
- Propose specification changes in **execution-boundary**
- Submit experimentation code to **execution-runtime-lab**
- Core enforcement changes require private repository access

---

## Version Alignment

| Layer | Current Version | Baseline |
|-------|----------------|----------|
| Specification | RC2_STRICT_ALIGNED | Tag: `RC2_STRICT_ALIGNED` |
| Public Runtime | v0.1.0-runtime-lab | Tag: `v0.1.0-runtime-lab` |
| Private Core | Phase1 Bootstrap | Commit: `e56b52d` |

**Cross-Lock:** PHASE4_CROSS_LOCK ensures spec-runtime alignment.

---

## Enforcement Verification Path

To verify enforcement across all three layers:

1. **Specification Review** (execution-boundary)
   ```bash
   git clone https://github.com/Nick-heo-eg/execution-boundary.git
   cd execution-boundary
   git checkout RC2_STRICT_ALIGNED
   cat artifacts/release_candidates/RC2_STRICT_ALIGNED/final_policy_alignment_results.json
   ```

2. **Public Runtime Verification** (execution-runtime-lab)
   ```bash
   git clone https://github.com/Nick-heo-eg/execution-runtime-lab.git
   cd execution-runtime-lab
   npm run demo:openclaw
   cat proof/openclaw_intercept/proof_manifest.json
   ```

3. **Private Core Access** (execution-runtime-core)
   - Request private repository access
   - Review `src/gate/authority_gate.ts` for enforcement logic
   - Run adversarial test suite

**Result:** Complete enforcement verification from specification → demonstration → implementation.
