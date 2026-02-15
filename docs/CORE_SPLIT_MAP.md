# Public → Private Core Split Map

**Created**: 2026-02-16
**Purpose**: Document migration mapping from public verification layer to private enforcement core

---

## Repository Split Overview

### Public Layer: execution-runtime-lab
**Role**: Verification, proof generation, reproducible testing
**Visibility**: Open source, frozen at v0.6-structural-absence
**URL**: https://github.com/Nick-heo-eg/execution-runtime-lab

### Private Core: execution-runtime-core
**Role**: Production enforcement, proprietary policy, cryptographic signing
**Visibility**: Private repository (reference only)
**URL**: https://github.com/Nick-heo-eg/execution-runtime-core (private)

---

## Component Mapping

### 1. Proof and Verification Components

| Public Component (execution-runtime-lab) | Private Core (execution-runtime-core) | Status |
|------------------------------------------|---------------------------------------|---------|
| `proof/STRUCTURAL_ABSENCE_PROOF.md` | Not migrated (stays public) | ✅ Public only |
| `proof/adversarial_tests.json` | Not migrated (stays public) | ✅ Public only |
| `proof/test_runner.ts` | Not migrated (stays public) | ✅ Public only |
| `proof/generate_proof_artifact.ts` | Not migrated (stays public) | ✅ Public only |
| `proof/decision_logger.ts` | `src/audit/decision_logger.ts` (enhanced) | 🔄 Forked |

**Rationale**: Public verification remains transparent. Private core uses enhanced logger with cryptographic signing.

---

### 2. Adversarial Testing

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| `.github/workflows/adversarial-proof.yml` | `.github/workflows/internal-verification.yml` | 🔄 Adapted |
| `proof/adversarial_tests.json` | Not migrated (reference from public) | ✅ Public reference |

**Rationale**: Public tests verify runtime guarantees. Private core runs same tests plus proprietary attack scenarios.

---

### 3. Decision Engine and Policy

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| `integrations/openclaw/decision_engine.ts` (demo) | `src/policy/evaluation_engine.ts` | 🚫 Replaced |
| Mock risk scoring | `src/policy/risk_scoring.ts` | 🚫 Proprietary |
| Hardcoded thresholds | `src/policy/threshold_manager.ts` | 🚫 Proprietary |

**Rationale**: Public demo uses placeholder logic. Private core implements real policy evaluation.

**What's NEW in Private**:
- `src/policy/ml_risk_model.ts` - Machine learning risk scoring
- `src/policy/rule_engine.ts` - Complex rule evaluation
- `src/policy/compliance_mappings.ts` - Regulatory compliance (GDPR, SOC2, etc.)

---

### 4. Contracts and Schemas

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| `contracts/authority_token.schema.json` | `contracts/authority_token.schema.json` | 📋 Vendored |
| `contracts/decision_event.schema.json` | `contracts/decision_event.schema.json` | 📋 Vendored |
| `contracts/runtime_contract.md` | `contracts/runtime_contract.md` | 📋 Vendored |

**Sync Method**: Copy from public → private (one-way)

**Command**:
```bash
# In execution-runtime-core:
cp -r ../execution-runtime-lab/contracts/ ./contracts/
```

**Rationale**: Contracts are defined publicly, consumed privately. Changes start in public, sync to private.

---

### 5. Cryptographic Components

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| None (not in public) | `src/crypto/signing.ts` | 🔒 Private only |
| None | `src/crypto/verification.ts` | 🔒 Private only |
| None | `src/crypto/key_manager.ts` | 🔒 Private only |
| None | `src/crypto/chain_hash.ts` | 🔒 Private only |

**Rationale**: Cryptographic implementation is proprietary. Public only verifies signatures, doesn't generate them.

---

### 6. Authority and Token Management

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| None (schema only) | `src/authority/token_issuer.ts` | 🔒 Private only |
| None | `src/authority/token_validator.ts` | 🔒 Private only |
| None | `src/authority/permission_checker.ts` | 🔒 Private only |

**Rationale**: Token generation requires private keys. Public only defines token format.

---

### 7. Runtime Execution Layer

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| `src/adapter/` (demo) | `src/runtime/adapter.ts` (production) | 🔄 Enhanced |
| `src/executor/` (excluded in STOP builds) | `src/runtime/executor.ts` (full) | 🔄 Enhanced |
| Type-level nullification | `src/runtime/type_enforcement.ts` | 🔄 Extended |

**What's NEW in Private**:
- `src/runtime/fail_closed.ts` - Infrastructure-level bypass prevention
- `src/runtime/resource_limits.ts` - Execution resource constraints
- `src/runtime/isolation.ts` - Container/VM isolation enforcement

---

### 8. Infrastructure and Deployment

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| None (not in public) | `infrastructure/` | 🔒 Private only |
| None | `deploy/` | 🔒 Private only |
| None | `src/infra/network_hooks.ts` | 🔒 Private only |

**Rationale**: Deployment patterns and infrastructure hooks are security-sensitive.

---

### 9. Audit and Logging

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| `decision_log.jsonl` (demo) | `src/audit/decision_log.ts` (production) | 🔄 Enhanced |
| Proof manifest generation | `src/audit/proof_generator.ts` | 🔄 Enhanced |
| None | `src/audit/tamper_detection.ts` | 🔒 Private only |
| None | `src/audit/compliance_reports.ts` | 🔒 Private only |

**Rationale**: Public demonstrates logging. Private implements tamper-proof audit trail.

---

### 10. OpenClaw Integration

| Public Component | Private Core | Status |
|------------------|--------------|---------|
| `integrations/openclaw/openclaw_adapter.ts` (demo) | `src/integrations/openclaw/adapter.ts` | 🔄 Production |
| `demo/openclaw_intercept_demo.ts` | Not migrated (demo only) | ✅ Public only |
| Mock tool call interception | `src/integrations/openclaw/intercept.ts` | 🔄 Production |

**What's NEW in Private**:
- `src/integrations/openclaw/credential_vault.ts` - Secure credential management
- `src/integrations/openclaw/session_tracking.ts` - Multi-session enforcement

---

## Migration Strategy

### What Stays Public (No Migration)

✅ **Frozen at v0.6** - These components remain in execution-runtime-lab:

```
proof/
├── STRUCTURAL_ABSENCE_PROOF.md
├── adversarial_tests.json
├── test_runner.ts
└── generate_proof_artifact.ts

docs/
├── PUBLIC_SCOPE.md
├── CORE_SPLIT_MAP.md (this file)
└── ...

.github/workflows/
├── adversarial-proof.yml
└── runtime-proof.yml

contracts/
├── authority_token.schema.json
├── decision_event.schema.json
└── runtime_contract.md
```

### What Migrates to Private Core

🔄 **Enhanced and extended** in execution-runtime-core:

```
src/
├── policy/          (NEW: proprietary risk scoring, rule engine)
├── crypto/          (NEW: signature generation, key management)
├── authority/       (NEW: token issuance, permission checking)
├── runtime/         (ENHANCED: production adapter, fail-closed enforcement)
├── audit/           (ENHANCED: tamper-proof logging, compliance reports)
└── integrations/    (ENHANCED: production OpenClaw adapter)

infrastructure/      (NEW: deployment, network hooks, monitoring)
deploy/              (NEW: production deployment scripts)
contracts/           (VENDORED: copied from public)
```

### What's Brand New in Private

🔒 **Never existed in public** - Created directly in execution-runtime-core:

- **Policy Engine**: ML risk models, complex rule evaluation, regulatory mappings
- **Cryptography**: EdDSA/ECDSA signing, key rotation, certificate chains
- **Authority System**: Multi-tenant token issuance, permission hierarchies
- **Fail-Closed Infrastructure**: Kernel-level hooks, network-level enforcement
- **Compliance**: SOC2, GDPR, HIPAA reporting and certification artifacts

---

## Directory Structure Comparison

### Public: execution-runtime-lab (v0.6)

```
execution-runtime-lab/
├── src/
│   ├── adapter/              (demo adapters)
│   ├── executor/             (excluded in STOP builds)
│   └── types/                (type definitions)
├── proof/
│   ├── STRUCTURAL_ABSENCE_PROOF.md
│   ├── adversarial_tests.json
│   ├── test_runner.ts
│   └── generate_proof_artifact.ts
├── integrations/
│   └── openclaw/             (demo integration)
├── contracts/                (interface schemas)
├── demo/                     (demos and examples)
├── docs/                     (documentation)
└── .github/workflows/        (CI verification)
```

### Private: execution-runtime-core (v1.x)

```
execution-runtime-core/
├── src/
│   ├── policy/               (risk scoring, rule engine)
│   ├── crypto/               (signing, verification, keys)
│   ├── authority/            (token issuance, permissions)
│   ├── runtime/              (production adapter, executor)
│   ├── audit/                (tamper-proof logging)
│   ├── integrations/         (production integrations)
│   └── infra/                (infrastructure enforcement)
├── contracts/                (vendored from public)
├── infrastructure/           (IaC, deployment configs)
├── deploy/                   (deployment scripts)
├── experiments/              (private R&D workspace)
│   └── phase6-continuation/  (experiments based on v0.6)
└── .github/workflows/        (internal CI + security scanning)
```

---

## Sync and Maintenance

### Contract Sync (Public → Private)

**Frequency**: On contract version bumps

**Process**:
1. Update contracts in `execution-runtime-lab`
2. Create PR for contract changes
3. Review and merge to main (public)
4. Vendor into `execution-runtime-core`:
   ```bash
   cd execution-runtime-core
   cp -r ../execution-runtime-lab/contracts/ ./contracts/
   git add contracts/
   git commit -m "chore: sync contracts from public v1.x.x"
   ```

### Proof Artifact Flow (Private → Public)

**Frequency**: Continuous (via CI)

**Process**:
1. Private core generates decision events
2. Proof artifacts exported to public-compatible format
3. Public verification suite validates proof artifacts
4. CI passes = enforcement verified

### Adversarial Test Sync (Bidirectional)

**Public → Private**: New attack patterns discovered publicly
**Private → Public**: Sanitized attack patterns from production incidents

**Process**:
1. Add new test case to `execution-runtime-lab/proof/adversarial_tests.json`
2. Verify public CI passes
3. Manually copy to private core test suite
4. Enhance with proprietary attack variations (private only)

---

## Version Alignment

| Public Release | Private Core Version | Alignment Notes |
|----------------|----------------------|-----------------|
| v0.6-structural-absence | v1.0.0 (baseline) | Initial separation. Public frozen, private begins. |
| v0.6 (frozen) | v1.1.0 | Private adds cryptographic signing |
| v0.6 (frozen) | v1.2.0 | Private adds fail-closed infrastructure |
| v0.6 (frozen) | v2.0.0 | Private adds ML risk models, enterprise features |

**Public repo stays at v0.6 indefinitely.** Private core evolves independently.

---

## Future Considerations

### If Public Needs Breaking Changes (v0.7+)

If contracts require breaking changes:
1. Update `contracts/runtime_contract.md` version (e.g., 2.0.0)
2. Create new schemas with `-v2` suffix
3. Release execution-runtime-lab v0.7 with new contracts
4. Private core maintains backward compatibility via adapters

### If Private Adds Public-Facing Features

If private develops features suitable for public demonstration:
1. Extract demo implementation (without proprietary logic)
2. Add to execution-runtime-lab as example
3. Document in PUBLIC_SCOPE.md as allowed addition
4. Maintain separation between demo and production code

---

## Security Considerations

### Information Leakage Prevention

**What Public Reveals**:
- Contract structure (token and decision event schemas)
- Verdict enumeration (STOP/HOLD/ALLOW)
- Verification methods (signature checking, hash validation)

**What Private Protects**:
- Risk scoring algorithms
- Policy evaluation logic
- Private signing keys
- Infrastructure hook implementation
- Deployment topology

### Audit Trail

All migrations and syncs should be traceable:
- Public changes via PR (audit log)
- Private vendoring via git commits (versioned)
- Contract updates documented in runtime_contract.md changelog

---

## Quick Reference

### I need to... Where do I go?

| Task | Repository |
|------|------------|
| Verify adversarial tests | execution-runtime-lab (public) |
| Generate authority tokens | execution-runtime-core (private) |
| Update contract schemas | execution-runtime-lab (public), then sync |
| Implement new policy rules | execution-runtime-core (private) |
| Add new attack test cases | execution-runtime-lab (public), then copy |
| Deploy to production | execution-runtime-core (private) |
| Reproduce structural proofs | execution-runtime-lab (public) |
| Rotate signing keys | execution-runtime-core (private) |

---

## Related Documentation

- [README.md](../README.md) - Repository overview
- [PUBLIC_SCOPE.md](PUBLIC_SCOPE.md) - Public/private boundary definition
- [contracts/runtime_contract.md](../contracts/runtime_contract.md) - Contract versioning
- [CHANGELOG.md](../CHANGELOG.md) - Version history

---

**Maintained by**: execution-runtime-lab maintainers
**Last Updated**: 2026-02-16
**Status**: Living document - updates via PR only
