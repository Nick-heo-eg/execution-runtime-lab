# Changelog

All notable changes to the Execution Runtime Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-02-16

### Added

- **Four-Layer Structural Enforcement Architecture**
  - Type System Level: Conditional types enforcing `execute?: never` for STOP/HOLD verdicts
  - Structural Code Level: Zero executor imports in STOP/HOLD handlers
  - Binary Artifact Level: Physical executor module exclusion from STOP builds
  - Runtime Behavior Level: Adversarial testing verification (8/8 passing)

- **Comprehensive Verification Suite** (`npm run verify:all`)
  - `verify:structural-absence` - Source code structural checks via grep
  - `verify:binary-absence` - Binary artifact verification
  - `verify:type-enforcement` - TypeScript compile-time enforcement checks
  - Unified verification command combining all layers

- **Build Configuration Matrix**
  - `tsconfig.stop.json` - Dedicated build profile excluding executor modules
  - `npm run build:stop` - STOP-only build with post-build cleanup
  - `npm run build:runtime` - Full runtime build with all capabilities

- **Consolidated Proof Documentation**
  - `proof/STRUCTURAL_ABSENCE_PROOF.md` - Unified enforcement report covering all four layers
  - Enhanced `proof_manifest.json` with four-layer enforcement metadata
  - Runtime contract version `EAR_INTERCEPT_v2_CONSOLIDATED`

### Changed

- Consolidated type-level and binary-level enforcement into unified architecture
- Updated README with v0.6 stable release information
- Updated proof manifest with consolidated enforcement layers metadata
- Improved package.json scripts for verification workflows
- Enhanced CI workflow with Node.js setup and dependency installation

### Removed

- **Deprecated Proof Documents** (consolidated into STRUCTURAL_ABSENCE_PROOF.md):
  - `proof/BINARY_ABSENCE_PROOF.md`
  - `proof/STRUCTURAL_TYPE_NULLIFICATION_PROOF.md`
  - `proof/CROSS_LAYER_ENFORCEMENT_NOTE.md`
  - `proof/openclaw_intercept/ARCHITECTURAL_ABSENCE_PROOF.md`
  - `proof/openclaw_intercept/INTERCEPT_RUNTIME_SUMMARY.md`

### Fixed

- TypeScript compilation errors in demo files (changed `decision` to `verdict`)
- CI workflow missing Node.js setup and npm install steps
- Import.meta compilation errors by excluding proof generation scripts

### Security

- Binary-level executor absence prevents execution even if runtime is compromised
- Type-level enforcement makes STOP/HOLD execution paths impossible at compile time
- Structural code isolation ensures zero executor module access for STOP/HOLD handlers

## [0.1.0-runtime-lab] - 2026-02-15 [DEPRECATED]

**Note:** This experimental release has been superseded by v0.6-structural-absence.

### Added

- Deterministic decision logging to `decision_log.jsonl` (JSONL format)
- SHA256 fingerprinting of all inputs
- Pre-execution mediation (STOP/HOLD verdicts block BEFORE execution)
- Automated adversarial test suite (8 attack patterns)
- GitHub Actions workflow for continuous verification
- Cryptographically verifiable proof artifacts
- Proof manifest generation with SHA256 integrity hash

### Features

- Total adversarial tests: 8
- Pass rate: 100%
- Attack patterns verified:
  - delete_server_files (rm -rf)
  - privilege_escalation (sudo)
  - token_exfiltration (credential theft)
  - hidden_prompt_injection
  - system_override
  - command_injection
  - path_traversal
  - reverse_shell

---

[0.6.0]: https://github.com/Nick-heo-eg/execution-runtime-lab/releases/tag/v0.6-structural-absence
[0.1.0-runtime-lab]: https://github.com/Nick-heo-eg/execution-runtime-lab/releases/tag/v0.1.0-runtime-lab
