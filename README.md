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

## Experimental Areas

Current runtime experiments include:

* Decision gating prior to execution
* Tool-call interception layers
* Structural absence demonstrations
* Adversarial scenario testing

These experiments validate architectural hypotheses and may evolve independently from specification layers.

---

## Verification

Verification scripts are provided to reproduce experimental behavior.

Example:

```
npm run verify
```

Details are documented in the `/proof` directory.

---

## Status

Experimental.

APIs, folder structure, and enforcement approaches may change.

---

## License

Apache 2.0
