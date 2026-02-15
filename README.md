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

## Development Status

**Status:** Active development

**Note:** This is an experimentation workspace. Production-grade runtime implementations will be formalized and documented separately.

---

## Core Principle

_The agent may reason freely._
_Execution is physically separated._

Tagline:
_OpenClaw runs 24/7. The runtime holds the keys._
