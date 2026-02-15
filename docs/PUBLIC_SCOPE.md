# Public Scope Declaration

**Repository**: execution-runtime-lab
**Status**: Frozen at v0.6-structural-absence
**Role**: Public verification and proof layer

---

## Purpose

This document defines the permanent boundary between public transparency (this repository) and private implementation (execution-runtime-core).

**execution-runtime-lab** serves as the **verification and proof layer** — a transparent, auditable demonstration of execution governance principles without exposing proprietary enforcement mechanisms.

---

## What Stays Public

The following components remain in this repository and may receive updates:

### 1. Proof Artifacts and Verification Scripts
- `proof/STRUCTURAL_ABSENCE_PROOF.md` - Unified enforcement documentation
- `proof/adversarial_tests.json` - Attack pattern test suite
- `proof/test_runner.ts` - Adversarial verification engine
- `proof/generate_proof_artifact.ts` - Proof manifest generator
- `npm run verify:all` - Multi-layer verification suite

**Why Public**: Demonstrates structural enforcement principles transparently. Anyone can reproduce the verification.

### 2. Documentation and Reproducibility Guides
- README.md - Repository overview and verification instructions
- CHANGELOG.md - Version history
- This file (docs/PUBLIC_SCOPE.md)
- Architecture diagrams and conceptual documentation

**Why Public**: Educational value. Shows what execution governance looks like without revealing how to bypass it.

### 3. CI/CD for Proof Validation
- `.github/workflows/adversarial-proof.yml` - Automated attack resistance testing
- `.github/workflows/runtime-proof.yml` - Structural absence verification
- Build verification scripts (verify:structural-absence, verify:binary-absence)

**Why Public**: Continuous verification that enforcement guarantees hold. Public CI builds trust.

### 4. Public Contracts and Interface Specifications
- `contracts/` - Minimal interface schemas (to be created)
  - authority_token.schema.json
  - decision_event.schema.json
  - runtime_contract.md
- Type definitions for public integration points

**Why Public**: Enables third-party integration without exposing enforcement internals. Clean API boundary.

### 5. Adversarial Test Suite
- Attack patterns (8 verified scenarios)
- Expected decision outcomes (STOP/HOLD/ALLOW)
- Verification that dangerous operations are blocked

**Why Public**: Proves the system works against real attacks. Transparency builds confidence.

### 6. OpenClaw Integration Demo
- `integrations/openclaw/openclaw_adapter.ts` - Tool call interception example
- `demo/openclaw_integr_demo.ts` - Demonstration of pre-execution mediation
- External interception pattern (no OpenClaw source modification)

**Why Public**: Shows how execution governance integrates with AI agent frameworks. Reference implementation.

---

## What Moves to Private Core

The following components have migrated to **execution-runtime-core** (private repository) and will NOT receive updates here:

### 1. Cryptographic Signing and Authority Issuance
- Signature generation and verification
- Authority token creation and validation
- Public key infrastructure (PKI)
- Certificate chain management

**Why Private**: Prevents attackers from studying signature patterns or finding bypass mechanisms. Security through obscurity is acceptable for implementation details when the algorithm is known.

### 2. Policy Enforcement Engine
- Risk scoring algorithms
- Threshold calculation logic
- Policy evaluation internals
- Decision tree implementations

**Why Private**: Proprietary business logic. Revealing exact scoring would enable adversarial optimization.

### 3. Production Secrets and Deployment Keys
- API keys for production services
- Database credentials
- Signing keys (private keys)
- Infrastructure access tokens

**Why Private**: Standard security practice. Never commit secrets.

### 4. Fail-Closed Infrastructure Logic
- Infrastructure-level bypass prevention
- Network-level enforcement hooks
- Container/VM escape mitigation
- Kernel-level execution gating (if implemented)

**Why Private**: Revealing infrastructure enforcement would expose attack surface. Defense in depth requires layered secrecy.

### 5. Runtime Executor Modules
- `src/executor/` - Actual execution functions
- ALLOW-path implementation details
- Execution result handling internals
- Resource cleanup and error recovery

**Why Private**: While STOP/HOLD enforcement is public, the actual execution logic is proprietary and may contain sensitive business logic.

### 6. Production Deployment Tooling
- Deployment scripts
- Infrastructure-as-code configurations
- Monitoring and alerting setups
- Incident response playbooks

**Why Private**: Operational security. Revealing deployment details aids attackers.

---

## Why This Separation?

### Transparency Without Vulnerability

**Public verification proves the system works** without revealing how to break it.

- Adversarial tests prove attacks are blocked ✅
- Structural absence proofs show enforcement is real ✅
- Implementation details that enable bypass remain private ✅

### Community Trust Through Reproducibility

Anyone can:
- Run `npm run verify:all` and see enforcement layers
- Execute adversarial tests and verify 8/8 blocks
- Build STOP-only binaries and confirm executor absence
- Audit CI workflows for proof validation

**But they cannot**:
- Study policy scoring algorithms to optimize attacks
- Extract signing keys to forge authority tokens
- Analyze infrastructure hooks to find bypass paths

### Development Velocity

- **Public repo**: Slow, stable, frozen at v0.6. Changes require community review.
- **Private repo**: Fast iteration on enforcement improvements without exposing WIP vulnerabilities.

### Commercial Viability

Execution governance is a product, not just a research project. The private core enables:
- Proprietary risk scoring (competitive advantage)
- Enterprise deployment patterns (customer-specific)
- Regulated industry compliance (confidential requirements)

---

## Connection Between Public and Private

### Contracts Directory (Vendor/Copy Pattern)

The public repo defines minimal interface schemas in `contracts/`:

```
contracts/
├── authority_token.schema.json    # Token format specification
├── decision_event.schema.json     # Decision log format
└── runtime_contract.md            # Semantic versioning of contracts
```

The private core **vendors or copies** these contracts:

```bash
# In execution-runtime-core (private):
cp -r ../execution-runtime-lab/contracts/ ./contracts/
# Or: git subtree for versioned sync
```

**No direct code dependencies.** Only shared interface schemas.

### Proof Artifacts Flow

```
Private Core (execution-runtime-core)
         ↓
   [Generates decisions]
         ↓
   [Logs to decision_log.jsonl]
         ↓
Public Verification (execution-runtime-lab)
         ↓
   [Consumes logs as proof artifacts]
         ↓
   [Verifies against expected outcomes]
         ↓
   [Publishes verification results]
```

The private core generates cryptographically signed proof artifacts. The public repo verifies them without accessing private logic.

---

## Enforcement Rules

### For Public Repository (execution-runtime-lab)

**Allowed Changes** (requires PR + review):
- Documentation improvements
- Proof script enhancements
- CI workflow fixes
- Contract schema updates (versioned)
- Adversarial test additions
- Verification tooling improvements

**Forbidden Changes** (will be rejected):
- Adding enforcement logic (belongs in private core)
- Committing secrets or credentials
- Implementing policy evaluation
- Adding cryptographic signing code
- Creating production deployment scripts

### For Private Repository (execution-runtime-core)

**Allowed** (standard development):
- Enforcement engine improvements
- Policy algorithm updates
- Infrastructure hardening
- Deployment automation
- Proprietary feature development

**Forbidden** (maintain separation):
- Moving proof verification back to private
- Duplicating adversarial tests (reference public suite)
- Re-implementing public contracts (vendor from public)

---

## Version Correspondence

| Public Release | Private Core Version | Changes |
|----------------|----------------------|---------|
| v0.6-structural-absence | (baseline) | Four-layer enforcement established |
| (frozen) | v1.x (future) | Cryptographic signing, fail-closed infrastructure |
| (frozen) | v2.x (future) | Advanced policy engines, regulated industry compliance |

The public repo remains frozen at v0.6. The private core evolves independently.

---

## Rationale for Permanent Freeze

**execution-runtime-lab is now a reference artifact**, not an active development workspace.

### What v0.6 Proves Forever

1. **Structural absence is real** - STOP builds physically exclude executor bytecode
2. **Type-level enforcement works** - Compile-time impossibility via conditional types
3. **Adversarial resistance is verifiable** - 8/8 attack patterns correctly blocked
4. **Execution governance is reproducible** - Anyone can run verification suite

These proofs don't expire. They demonstrate the foundational principles.

### What Continues in Private

- Hardening against new attack vectors
- Performance optimization
- Enterprise feature development
- Regulatory compliance certification

**The principles are public. The implementation is private.**

---

## Audit Trail

All changes to this repository (post-freeze) require:

1. **Branch creation** from main
2. **Pull request** with description
3. **CI verification** (adversarial + runtime proof)
4. **Review** against PUBLIC_SCOPE rules
5. **Merge** only if scope-compliant

No direct commits to main. No exceptions.

---

## Related Documentation

- [README.md](../README.md) - Repository overview
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [proof/STRUCTURAL_ABSENCE_PROOF.md](../proof/STRUCTURAL_ABSENCE_PROOF.md) - Enforcement documentation
- [Private Core Repository](https://github.com/Nick-heo-eg/execution-runtime-core) - **(private, link for reference only)**

---

## Questions and Answers

**Q: Why not keep everything private?**
A: Execution governance requires trust. Public verification builds that trust without exposing vulnerabilities.

**Q: Why not keep everything public?**
A: Security through obscurity is wrong for algorithms, correct for implementation details. We publish the what, protect the how.

**Q: Can I fork this repo and add enforcement logic?**
A: Yes, it's open for learning. But production enforcement requires the private core (proprietary).

**Q: How do I integrate with execution-runtime-lab?**
A: Use the contracts/ schemas as integration points. The public repo is a reference, not a runtime.

**Q: Will you publish the private core later?**
A: No. The separation is permanent. Public verification + private enforcement is the product model.

---

**Last Updated**: 2026-02-16
**Applies to**: v0.6-structural-absence and all future versions
**Status**: Sealed — changes require explicit work order
