# Execution Runtime Lab

**Role:** Runtime experimentation workspace separated from specification.

This repository contains experimental runtime environments exploring structural separation between judgment and execution.

It is not a specification, product, or production enforcement engine.

---

## Purpose

Execution Runtime Lab exists to prototype and test runtime implementations aligned with the Execution Boundary architecture.

It explores:

* Pre-execution decision mediation
* Structural separation of reasoning and execution
* Observable decision logging
* Runtime enforcement experiments

All implementations are experimental and may change.

---

## Relationship to Other Repositories

* `execution-boundary` — conceptual anchor and architectural map
* `ai-judgment-trail-spec` — decision trace schema
* `telegram-judgment-demo-proof` — demonstration of structural STOP/HOLD states

This repository focuses on runtime experimentation only.

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/Nick-heo-eg/execution-runtime-lab
cd execution-runtime-lab

# Install dependencies
npm install

# Run verification
npm run verify

# View proof artifacts
cat proof/STRUCTURAL_ABSENCE_PROOF.md
```

---

## Documentation

For detailed technical documentation and structural proofs:

* [Overview](docs/OVERVIEW.md) — Architectural context and philosophy
* [Structural Enforcement](docs/STRUCTURAL_ENFORCEMENT.md) — Four-layer enforcement model
* [Public/Private Boundary](docs/PUBLIC_PRIVATE_BOUNDARY.md) — Separation rationale and version strategy
* [Adversarial Verification](docs/ADVERSARIAL_VERIFICATION.md) — Verification methodology
* [Technical Details](docs/TECHNICAL_DETAILS.md) — Type-level and binary-level implementation

---

## What This Repository Contains

* Experimental decision engines
* Runtime mediation prototypes
* Verification scripts and reproducible tests
* Demonstration adapters (e.g., tool-call interception)

---

## What This Repository Does Not Contain

* Stable specification definitions
* Production signing keys
* Enterprise policy engines
* Compliance guarantees
* Finalized cryptographic enforcement infrastructure

---

## Status

Experimental.

APIs, folder structure, and enforcement approaches may change.

---

## License

Apache 2.0
