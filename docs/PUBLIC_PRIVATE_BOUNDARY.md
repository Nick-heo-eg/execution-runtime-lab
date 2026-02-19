# Public vs Private Boundary Model

This repository operates under a **transparent verification** model, distinct from the private enforcement core.

---

## Separation Rationale

The public layer proves structural concepts transparently.

The private layer implements production-grade enforcement with proprietary security infrastructure.

This separation ensures:

1. **Verifiability**: Anyone can verify structural claims without access to private enforcement
2. **Security**: Production keys and enforcement logic remain protected
3. **Auditability**: Public proofs demonstrate guarantees without exposing implementation
4. **Evolution**: Private enforcement can evolve independently of public proof baseline

---

## Public Layer (execution-runtime-lab)

**Philosophy**: Verifiable structural guarantees through transparent proofs.

### Responsibilities

* **Adversarial Proof Generation**: Demonstrate that STOP verdicts structurally prevent execution
* **Structural Enforcement Demos**: Show compile-time, code-level, and binary-level absence
* **Verifiable CI Artifacts**: Public GitHub Actions workflows anyone can audit
* **Reproducible Test Suites**: Adversarial scenarios with deterministic outcomes

### What This Layer Provides

* Evidence that structural enforcement CAN exist
* Proof that STOP paths do not import executor code
* Binary artifacts demonstrating physical separation
* Transparent verification anyone can reproduce

### What This Layer Does NOT Provide

* Production signing keys or authority issuance
* Enterprise policy evaluation logic
* Fail-closed runtime infrastructure
* Cryptographic enforcement mechanisms

---

## Private Layer (execution-runtime-core)

**Philosophy**: Fail-closed enforcement with cryptographic authority.

### Responsibilities

* **Authority Engine**: Token issuance with ED25519 signatures
* **Signing Infrastructure**: HSM/KMS integration for production keys
* **Enterprise Enforcement Logic**: Policy evaluation and scope verification
* **Fail-Closed Runtime**: Deny-by-default with immutable audit trails

---

## Public Boundary Declaration

**This repository is frozen at v0.6 as the public verification and proof layer.**

### What Stays Public (Allowed Changes)

* Proof artifacts and verification scripts
* Documentation and reproducibility guides
* CI/CD for proof validation
* Public contracts and interface specifications
* Adversarial test suite

### What Moves to Private Core (No Future Changes Here)

* Cryptographic signing and authority issuance
* Policy enforcement engine
* Production secrets and deployment keys
* Fail-closed infrastructure logic
* Runtime executor modules

**Implementation Core:** All production enforcement logic has moved to a private repository (`execution-runtime-core`). This public layer provides transparent verification and reproducible proofs.

---

## Version Strategy

This project maintains **dual release tracks** with distinct version schemes:

| Repository | Track | Version Pattern | Focus | Latest |
|------------|-------|-----------------|-------|--------|
| **execution-runtime-lab** (Public) | Structural Reference | `v0.6.x` | Proof maturity, verification techniques | v0.6-structural-absence |
| **execution-runtime-core** (Private) | Enterprise Engine | `v1.x` | Enforcement capability, production features | v1.0 (product-v1.0) |

**Rationale**: Public and private repos address different concerns and evolve independently.

* **Public (v0.6.x)**: Structural proof demonstrations frozen at v0.6 baseline. Patches may address verification scripts or documentation.
* **Private (v1.x)**: Production enforcement engine with cryptographic authority, fail-closed guarantees, and enterprise policy evaluation.

**Version Independence**: Public v0.6 does NOT correspond to private v1.0. They are separate maturity indicators.

---

## Interface Contract

* Defined in `contracts/` (JSON Schema only)
* No runtime code dependency between layers
* Data format compatibility, not implementation coupling

**Core Enforcement Engine**: Isolated in private repository. Public repo provides verifiable structural guarantees only.
