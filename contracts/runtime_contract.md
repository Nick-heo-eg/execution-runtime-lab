# Runtime Contract Specification

**Version**: 1.0.0
**Status**: Stable
**Last Updated**: 2026-02-16

---

## Purpose

This document defines the **interface contract** between the public verification layer (execution-runtime-lab) and the private enforcement core (execution-runtime-core).

**Key Principle**: The contract specifies *what* is communicated, not *how* it is enforced.

---

## Contract Versioning

### Semantic Versioning

Contracts follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR**: Breaking changes to schema structure (incompatible)
- **MINOR**: Backward-compatible additions (new optional fields)
- **PATCH**: Clarifications, documentation fixes (no schema changes)

**Current Version**: `1.0.0` (initial stable release)

### Version Compatibility

| Contract Version | Public Layer (execution-runtime-lab) | Private Core (execution-runtime-core) |
|------------------|--------------------------------------|---------------------------------------|
| 1.0.0 | v0.6-structural-absence | v1.x (baseline) |
| 1.1.x (future) | v0.6+ (backward compatible) | v1.x+ (enhanced features) |
| 2.0.x (future) | v0.7+ (breaking changes) | v2.x+ (major refactor) |

---

## Contract Components

### 1. Authority Token Contract

**Schema**: `authority_token.schema.json`
**Purpose**: Cryptographically signed token authorizing execution governance decisions

**Required Fields**:
- `token_id` (UUIDv4) - Unique token identifier
- `issuer` (string) - Authority that issued token
- `issued_at` (ISO 8601) - Issuance timestamp
- `expires_at` (ISO 8601) - Expiration timestamp
- `permissions` (object) - Allowed verdicts and constraints
- `signature` (object) - Cryptographic signature proving authenticity

**Stability Guarantee**: Fields marked "required" will never be removed or renamed in MINOR/PATCH updates.

**Extension Points**: `metadata` object allows implementation-specific extensions without contract changes.

---

### 2. Decision Event Contract

**Schema**: `decision_event.schema.json`
**Purpose**: Logged execution governance decision for audit and verification

**Required Fields**:
- `event_id` (UUIDv4) - Unique event identifier
- `timestamp` (ISO 8601) - Decision timestamp
- `verdict` (enum: STOP/HOLD/ALLOW) - Execution verdict
- `input_hash` (SHA256) - Hash of input payload
- `policy_id` (string) - Policy used for decision

**Optional Fields**:
- `execution_attempted` (boolean) - Whether execution occurred
- `execution_result` (enum: success/error/null) - Execution outcome
- `risk_score` (float 0.0-1.0) - Calculated risk score
- `risk_factors` (array) - Contributing risk factors
- `authority_token_id` (string) - Reference to authority token
- `source` (string) - Source of request (openclaw, api, cli, etc.)
- `intercepted` (boolean) - Pre-execution interception flag
- `metadata` (object) - Additional audit metadata
- `proof` (object) - Cryptographic proof of integrity

**Stability Guarantee**: Optional fields may be added in MINOR versions. Existing fields never change meaning.

---

## Contract Invariants

These guarantees hold across all contract versions:

### 1. Pre-Execution Mediation

```
IF verdict === "STOP" THEN execution_attempted === false
IF verdict === "HOLD" THEN execution_attempted === false
IF verdict === "ALLOW" THEN execution_attempted === true (unless error)
```

**Invariant**: STOP and HOLD verdicts NEVER have `execution_attempted: true`.

### 2. Deterministic Input Hashing

```
input_hash = SHA256(canonical_json(input_payload))
```

**Invariant**: Same input always produces same hash. Enables reproducible verification.

### 3. Cryptographic Signature Verification

```
VERIFY(signature.value, token_payload, public_key[signature.public_key_id]) === true
```

**Invariant**: All authority tokens include verifiable signatures. Unsigned tokens are invalid.

### 4. Verdict Enumeration

```
verdict ∈ {"STOP", "HOLD", "ALLOW"}
```

**Invariant**: Only three verdicts exist. No other values permitted.

---

## Integration Patterns

### Public Layer Consumption

The public verification layer consumes decision events WITHOUT executing:

```typescript
// Public layer reads decision logs
const event: DecisionEvent = readFromLog('decision_log.jsonl');

// Verify against expected outcome
assert(event.verdict === "STOP", "Expected STOP verdict");
assert(event.execution_attempted === false, "STOP should not execute");

// Validate cryptographic proof
assert(verifySignature(event.proof.signature), "Invalid signature");
```

**The public layer NEVER generates decisions.** It only verifies them.

### Private Core Production

The private enforcement core generates decision events:

```typescript
// Private core evaluates policy (proprietary logic)
const verdict = evaluatePolicy(input, policy);

// Generate signed decision event
const event: DecisionEvent = {
  event_id: generateUUID(),
  timestamp: new Date().toISOString(),
  verdict: verdict,
  input_hash: sha256(canonicalize(input)),
  policy_id: policy.id,
  proof: {
    signature: sign(eventPayload, privateKey)
  }
};

// Log for public verification
appendToLog('decision_log.jsonl', event);
```

**The private core NEVER exposes policy evaluation logic.** Only results.

---

## Contract Sync Pattern

### Vendor/Copy Approach

The private core vendors contracts from the public repo:

```bash
# In execution-runtime-core (private repo):
cp -r ../execution-runtime-lab/contracts/ ./contracts/

# Or using git subtree (versioned sync):
git subtree add --prefix contracts/ \
  https://github.com/Nick-heo-eg/execution-runtime-lab.git \
  main:contracts/ --squash
```

**Direction**: Public → Private (one-way)

**Frequency**: On contract version bumps or as needed

**Validation**: Private core runs schema validation tests against vendored contracts

---

## Breaking Change Policy

### When MAJOR Version Increments

Breaking changes require MAJOR version bump (e.g., 1.0.0 → 2.0.0):

- Removing required fields
- Renaming fields
- Changing field types (e.g., string → number)
- Removing enum values from `verdict`
- Changing hash algorithm (SHA256 → other)

**Migration Path**: Public and private repos both update simultaneously with migration guide.

### When MINOR Version Increments

Backward-compatible additions (e.g., 1.0.0 → 1.1.0):

- Adding new optional fields
- Adding new metadata extensions
- Adding new signature algorithms (preserving existing)
- Adding new risk factor types

**Migration Path**: Private core can adopt new features. Public layer ignores unknown fields (forward compatible).

### When PATCH Version Increments

Documentation only (e.g., 1.0.0 → 1.0.1):

- Clarifying field descriptions
- Adding examples
- Fixing typos
- Updating this document

**Migration Path**: No code changes required.

---

## Validation and Testing

### Schema Validation

Both public and private repos MUST pass JSON Schema validation:

```bash
# Validate authority token
ajv validate -s contracts/authority_token.schema.json -d example_token.json

# Validate decision event
ajv validate -s contracts/decision_event.schema.json -d example_decision.json
```

### Contract Compliance Tests

Public repo includes compliance tests (anyone can run):

```bash
npm run test:contract-compliance
```

**Tests verify**:
- Schema validity (well-formed JSON Schema)
- Example conformance (examples match schema)
- Invariant preservation (STOP → no execution)
- Signature format correctness

Private core runs same tests against its implementations (closed source).

---

## Security Considerations

### What the Contract Exposes

**Public Information**:
- Token and event structure
- Required signature algorithms
- Verdict enumeration (STOP/HOLD/ALLOW)
- Hash algorithm (SHA256)

**Private Information** (NOT in contract):
- Policy evaluation logic
- Risk scoring algorithms
- Private signing keys
- Infrastructure enforcement mechanisms

### Attack Surface

**Contract does NOT reveal**:
- How to forge signatures (private keys remain secret)
- How to bypass policy evaluation (algorithms proprietary)
- How to manipulate risk scores (scoring logic private)
- How to evade infrastructure hooks (deployment details private)

**Contract DOES enable**:
- Third-party integration (via schemas)
- Verification of decisions (via signatures)
- Audit of execution governance (via decision logs)
- Reproducible testing (via public verification suite)

---

## Future Evolution

### Planned Additions (Non-Breaking)

- **v1.1.0**: Add `chain_hash` linking for tamper detection
- **v1.2.0**: Add `compliance_metadata` for regulated industries
- **v1.3.0**: Add `performance_metrics` for execution timing

### Potential Breaking Changes (v2.0.0+)

- Transition from SHA256 to quantum-resistant hashing
- Multi-verdict support (beyond STOP/HOLD/ALLOW)
- Nested decision trees (hierarchical verdicts)

**Commitment**: v1.x contracts remain stable for minimum 2 years (until 2028-02-16).

---

## References

- [JSON Schema Draft 07](https://json-schema.org/draft-07/schema)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [RFC 3339 (ISO 8601 Timestamps)](https://www.rfc-editor.org/rfc/rfc3339)
- [RFC 6234 (SHA-256)](https://www.rfc-editor.org/rfc/rfc6234)

---

## Changelog

### v1.0.0 (2026-02-16)

**Initial stable release**

- Defined `authority_token.schema.json` with signature verification
- Defined `decision_event.schema.json` with proof chain
- Established contract versioning policy
- Documented integration patterns
- Sealed four core invariants (pre-execution, hashing, signatures, verdicts)

---

**Contract Steward**: execution-runtime-lab maintainers
**Implementation**: execution-runtime-core (private)
**Status**: Sealed — changes require explicit version bump
