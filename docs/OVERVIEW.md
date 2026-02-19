# Execution Runtime Lab - Overview

This document provides architectural context for the execution-runtime-lab repository.

---

## Purpose

**Verifiable Execution Authority Boundary Reference Implementation**

This repository demonstrates structural execution prevention.

It does not contain the production authority engine.

Core cryptographic enforcement resides in a sealed private module.

---

## Core Philosophy

**STOP is not a rejection state. It is a structural absence of execution.**

Key principles:

* Execution prevention occurs across four distinct layers
* Public verification enables transparent proof without exposing production enforcement
* Structural guarantees are demonstrated through reproducible tests
* Binary artifacts physically exclude executor code in STOP/HOLD builds

---

## Relationship to Private Core

This public repository demonstrates structural guarantees.

Production enforcement resides in `execution-runtime-core` (private).

**Public layer (execution-runtime-lab):**
- Verifiable structural guarantees through transparent proofs
- Adversarial proof generation
- Reproducible test suites
- CI artifacts anyone can audit

**Private layer (execution-runtime-core):**
- Fail-closed enforcement with cryptographic authority
- Authority engine with ED25519 signatures
- HSM/KMS integration for production keys
- Enterprise policy evaluation logic

---

## Navigation

* [Structural Enforcement Layers](STRUCTURAL_ENFORCEMENT.md) — Four-layer enforcement model
* [Public/Private Boundary](PUBLIC_PRIVATE_BOUNDARY.md) — Separation rationale and version strategy
* [Adversarial Verification](ADVERSARIAL_VERIFICATION.md) — Verification methodology
* [Technical Details](TECHNICAL_DETAILS.md) — Type-level and binary-level implementation

---

## Current Status

**Version:** v0.6-structural-absence

This repository is frozen at v0.6 as the public verification and proof layer.

All production enforcement logic has moved to the private `execution-runtime-core` repository.
