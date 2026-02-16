# Execution Authority Minimal Specification v0.1

**Status**: Draft
**Date**: 2026-02-16
**Scope**: Model-agnostic execution authority enforcement

---

## Abstract

This specification defines the minimal structural requirements for pre-execution authority mediation in autonomous agent systems. It establishes four immutable invariants that any compliant implementation MUST enforce, independent of model architecture, deployment mode, or runtime environment.

**Core Principle**: Execution is not a default capability. It is a privilege that must be explicitly granted through verifiable authority.

---

## Terminology

**Execution Proposal**: A structured request to perform an action (e.g., tool call, API invocation, file operation).

**Authority Token**: A cryptographically verifiable credential that binds permission to a specific execution proposal.

**Execution Capability**: The ability to invoke an action. Capability exists only when valid authority is present.

**Authority Mediator**: A system component that evaluates proposals and issues authority tokens or denial verdicts.

**Fail-Closed**: A security property where any error, verification failure, or exceptional condition results in denial of execution.

**Observable Absence**: The property that STOP/DENY verdicts produce auditable evidence of non-execution.

---

## Scope

### In Scope

This specification defines:
- Structural invariants for authority enforcement
- Observable properties of compliant systems
- Verification requirements for authority tokens
- Failure mode guarantees

### Out of Scope

This specification does NOT define:
- Token format or serialization (implementation-specific)
- Cryptographic algorithms (defer to industry standards)
- Policy evaluation logic (application-specific)
- Transport protocols (deployment-specific)

---

## Four Immutable Invariants

Compliant implementations MUST enforce all four invariants. Violation of any invariant means non-compliance.

---

### Invariant 1: Execution Must Require Explicit Authority Token

**Statement**: No execution may proceed without an explicit authority token binding permission to the specific execution proposal.

**Structural Requirement**:
```
IF execution_proposal is submitted
THEN authority_token MUST be present AND valid
OTHERWISE execution capability does not exist
```

**Observable Property**:
- Systems MUST NOT execute actions by default
- Absence of authority token → Absence of execution capability
- Execution entry points MUST gate on authority verification

**Non-Compliance Examples**:
- ❌ Executing actions without checking authority tokens
- ❌ Default-allow policies (execution proceeds unless explicitly denied)
- ❌ Implicit authority (e.g., "if token is missing, infer ALLOW")

**Compliance Verification**:
- Audit: Examine execution entry points for authority checks
- Test: Submit proposals without tokens → Expect denial
- Proof: Demonstrate that execution code paths require authority

---

### Invariant 2: Authority Must Be Cryptographically Verifiable

**Statement**: Authority tokens MUST be cryptographically bound to execution proposals such that forgery, replay, and tampering are detectable.

**Structural Requirement**:
```
authority_token MUST include:
  - Cryptographic signature (verifiable via public key)
  - Proposal binding (e.g., hash of canonical proposal)
  - Temporal binding (issuance time, expiry time)
  - Scope declaration (permitted actions/resources)
```

**Observable Property**:
- Tokens cannot be reused for different proposals (proposal binding)
- Tokens cannot be used beyond expiry (temporal binding)
- Tokens cannot be forged without private key (signature verification)

**Non-Compliance Examples**:
- ❌ Plain text tokens (no cryptographic signature)
- ❌ Tokens without proposal binding (reusable for any action)
- ❌ Tokens without expiry (indefinite validity)

**Compliance Verification**:
- Audit: Examine token structure for signature, binding, expiry
- Test: Submit token with modified proposal → Expect verification failure
- Test: Submit expired token → Expect denial
- Proof: Demonstrate cryptographic verification before execution

---

### Invariant 3: Failure to Verify Must Abort Execution

**Statement**: Any verification failure, cryptographic error, or exceptional condition MUST result in immediate denial of execution. No execution proceeds on error.

**Structural Requirement**:
```
IF signature_verification fails
OR token_expired
OR proposal_binding_mismatch
OR scope_violation
OR any_verification_error
THEN abort_execution_immediately
  AND log_denial_verdict
  AND return_denial_response
```

**Observable Property**:
- Fail-closed behavior (errors always deny, never allow)
- No fallback to default-allow on error
- Denial verdicts are logged and observable

**Non-Compliance Examples**:
- ❌ Proceeding with execution if verification throws exception
- ❌ Treating verification errors as warnings (execute anyway)
- ❌ Falling back to default-allow if token is malformed

**Compliance Verification**:
- Audit: Examine error handling in verification paths
- Test: Submit malformed token → Expect denial (not error escalation)
- Test: Submit token with invalid signature → Expect denial
- Proof: Demonstrate that all verification errors lead to abort

---

### Invariant 4: Absence of Execution Must Be Observable and Auditable

**Statement**: When execution is denied, the system MUST produce observable evidence that no execution occurred. Denial verdicts must be auditable.

**Structural Requirement**:
```
IF execution is denied
THEN system MUST emit:
  - Denial verdict (STOP/DENY/HOLD)
  - Timestamp of denial
  - Reason for denial (e.g., "invalid signature", "expired token")
  - Proposal identifier or hash
  - Observable confirmation: executed = false
```

**Observable Property**:
- Denial verdicts are logged immutably
- Observers can verify that denied proposals did not execute
- Audit trails are cryptographically tamper-evident (recommended)

**Non-Compliance Examples**:
- ❌ Silent denial (no logging, no observable output)
- ❌ Ambiguous response (unclear whether execution occurred)
- ❌ Mutable logs (denial records can be altered)

**Compliance Verification**:
- Audit: Examine logging infrastructure for denial events
- Test: Submit proposal that should be denied → Verify logged denial
- Proof: Demonstrate immutable audit trail with denial records

---

## Compliance Levels

### Level 1: Structural Compliance (Minimum)

**Requirements**:
- ✅ Invariant 1: Authority token checks at all execution entry points
- ✅ Invariant 2: Basic cryptographic verification (signature, binding, expiry)
- ✅ Invariant 3: Fail-closed on verification errors
- ✅ Invariant 4: Denial logging with `executed = false`

**Verification Method**: Code audit, structural testing

**Use Case**: Development, proof-of-concept, non-production systems

### Level 2: Cryptographic Compliance (Recommended)

**Additional Requirements**:
- ✅ Industry-standard cryptography (e.g., ED25519, RSA-PSS)
- ✅ Canonical proposal serialization (deterministic hashing)
- ✅ Time-bound tokens with enforced expiry (TTL)
- ✅ Immutable audit logging with cryptographic integrity

**Verification Method**: Security audit, adversarial testing

**Use Case**: Production systems, enterprise deployments

### Level 3: Formal Compliance (Advanced)

**Additional Requirements**:
- ✅ Formal verification of invariants (e.g., type-level proofs)
- ✅ Binary-level enforcement (e.g., executor exclusion in STOP builds)
- ✅ Hardware-backed key storage (HSM/KMS)
- ✅ Distributed audit trail with Merkle tree verification

**Verification Method**: Formal methods, proof artifacts, adversarial red team

**Use Case**: Safety-critical systems, regulated industries, high-assurance environments

---

## Verification Guidance

### For Implementers

1. **Authority Check Verification**
   - Audit all execution entry points
   - Ensure no path exists to execute without authority token
   - Test with missing/invalid tokens → Expect denial

2. **Cryptographic Verification**
   - Use established cryptographic libraries (avoid custom crypto)
   - Bind tokens to canonical proposal representation
   - Enforce token expiry at verification time

3. **Fail-Closed Testing**
   - Inject verification errors (malformed tokens, invalid signatures)
   - Confirm all errors result in denial (no false positives)
   - Verify no execution proceeds on error conditions

4. **Audit Trail Verification**
   - Log all denial verdicts with reason and timestamp
   - Ensure logs are append-only (immutable)
   - Provide observable confirmation: `executed = false`

### For Auditors

1. **Structural Audit**
   - Examine execution entry points for authority checks
   - Trace denial paths to confirm fail-closed behavior
   - Verify logging infrastructure for denial events

2. **Adversarial Testing**
   - Attempt token forgery (invalid signature)
   - Attempt token replay (reuse for different proposal)
   - Attempt token tampering (modify expiry, scope)
   - Attempt execution without token

3. **Proof Validation**
   - Request proof artifacts (audit logs, test results)
   - Verify cryptographic integrity of audit trails
   - Confirm compliance with all four invariants

---

## Relationship to Existing Standards

### RFC 8785 (JSON Canonicalization Scheme)

**Relevance**: Deterministic serialization for proposal hashing

**Application**: Implementations MAY use RFC 8785 for canonical JSON to ensure consistent proposal binding.

### FIPS 186-4 (Digital Signature Standard)

**Relevance**: Cryptographic signature algorithms

**Application**: Implementations SHOULD use FIPS-approved signature algorithms (e.g., ED25519, RSA-PSS) for authority token signing.

### OAuth 2.0 / JWT (RFC 7519)

**Relevance**: Token structure and claims model

**Application**: Implementations MAY adapt JWT structure for authority tokens, provided all four invariants are enforced.

**Note**: Standard JWT does NOT enforce proposal binding (Invariant 2). Implementations MUST extend JWT with proposal hash binding to achieve compliance.

---

## Non-Goals

This specification explicitly does NOT address:

1. **Prompt Safety**: Input sanitization, jailbreak detection (orthogonal concern)
2. **Semantic Filtering**: Content moderation, toxicity detection (out of scope)
3. **Model Behavior Control**: Reasoning path shaping, inference guidance (separate layer)
4. **Rate Limiting**: Request throttling, resource quotas (infrastructure concern)
5. **Data Loss Prevention**: PII detection, exfiltration blocking (separate security layer)

---

## Implementation Patterns

### Pattern 1: Pre-Execution Mediation Layer

**Architecture**:
```
LLM Output → Authority Mediator → Execution Layer
             ↓
          [Authority Token]
             ↓
          Executor (with capability)
```

**Compliance**: Mediator issues tokens, executor verifies before action

### Pattern 2: Capability-Based Execution

**Architecture**:
```
Execution Proposal → Capability Check → Execute (if capability present)
                                      → Deny (if capability absent)
```

**Compliance**: Capability exists only when authority token is valid

### Pattern 3: Type-Level Enforcement

**Architecture**:
```
type ExecutionCapability<Decision> =
  Decision extends 'ALLOW' ? { execute: () => Result }
                            : { execute?: never }
```

**Compliance**: Compiler prevents execution calls on STOP/DENY states

---

## Compliance Checklist

Implementations seeking compliance MUST satisfy:

- [ ] **Invariant 1**: Authority token required for execution
  - [ ] All entry points check for authority
  - [ ] No default-allow execution paths
  - [ ] Missing token → Denial

- [ ] **Invariant 2**: Cryptographic authority verification
  - [ ] Signature verification before execution
  - [ ] Proposal binding (hash or digest)
  - [ ] Token expiry enforcement
  - [ ] Scope validation

- [ ] **Invariant 3**: Fail-closed on verification errors
  - [ ] Invalid signature → Denial
  - [ ] Expired token → Denial
  - [ ] Malformed token → Denial
  - [ ] Verification exception → Denial

- [ ] **Invariant 4**: Observable absence of execution
  - [ ] Denial verdicts logged
  - [ ] Timestamp and reason recorded
  - [ ] `executed = false` observable
  - [ ] Audit trail immutable (recommended)

---

## Future Work

### Proposed Extensions (v0.2+)

- **Standardized Token Format**: Define canonical authority token schema
- **Transport Protocol**: Specify mediator-executor communication protocol
- **Policy Definition Language**: Standardized policy expression format
- **Federation Protocol**: Cross-organization authority delegation

### Research Directions

- **Formal Verification**: Machine-checkable proofs of invariant enforcement
- **Zero-Knowledge Proofs**: Privacy-preserving authority verification
- **Distributed Authority**: Multi-party authorization and consensus

---

## Revision History

- **v0.1 (2026-02-16)**: Initial draft specification
  - Four immutable invariants defined
  - Compliance levels specified
  - Verification guidance provided

---

## License and Governance

**Status**: Draft specification (not yet standardized)

**Feedback**: Submit issues or proposals to the reference implementation repository

**Standardization Path**: This specification is a candidate for future standardization through an appropriate standards body (e.g., IETF, W3C, OASIS).

---

## Contact

**Reference Implementation**: [execution-runtime-lab](https://github.com/Nick-heo-eg/execution-runtime-lab)

**Production Engine**: execution-runtime-core (private repository)

**Questions**: Submit issues to the public reference implementation repository

---

**Draft v0.1 — 2026-02-16**
