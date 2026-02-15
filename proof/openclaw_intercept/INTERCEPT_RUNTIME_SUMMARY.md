# OpenClaw External Intercept Runtime Contract

## Enforcement Guarantees

### 1. No Modification to OpenClaw Source

The interception layer operates **externally** to OpenClaw. No changes are made to OpenClaw's core code, tool implementations, or execution flow.

**Implementation:**
- OpenClaw generates `tool_call` objects normally
- `openclaw_adapter.ts` receives these objects via `receiveToolCall()`
- Adapter acts as an external mediation layer, not an internal modification

**Verification:**
- OpenClaw source remains unchanged
- Interception occurs at the tool call boundary, not within OpenClaw execution path

### 2. Deterministic Pre-Execution STOP Enforcement

All STOP decisions are made **BEFORE** any execution occurs. The decision process is deterministic and cryptographically verifiable.

**Implementation:**
- `decision_engine.ts` evaluates risk based on:
  - Forbidden action list (e.g., `delete_server_files`, `reverse_shell`)
  - Risk score calculation (threshold: 8 for STOP, 5 for HOLD)
  - Argument pattern analysis (sudo, rm, delete, etc.)
- Decision made BEFORE `execute()` is ever called

**Code Path:**
```
receiveToolCall()
  → evaluateDecision()
  → if (verdict === 'STOP') return { executed: false }
  → [Execution path does not exist]
```

**Verification:**
- Check `executed: false` in all STOP results
- Verify no execution function is imported or called in adapter when STOP

### 3. Cryptographic Proof Generation Per Decision

Every decision generates a cryptographic proof artifact with SHA256 hash.

**Implementation:**
- `decision_logger.ts` logs each decision to JSONL with:
  - `decision_hash`: SHA256 of (action + resource + arguments + verdict + timestamp)
  - `timestamp`: Unix timestamp of decision
  - `source`: "openclaw_mock"
  - `intercepted`: true
- `proof_manifest.json` aggregates all decisions with metadata

**Proof Fields:**
```json
{
  "verdict": "STOP",
  "action": "delete_server_files",
  "decision_hash": "a7f3c2d1...",
  "timestamp": 1739587200000,
  "intercepted": true,
  "source": "openclaw_mock"
}
```

**Verification:**
- Hash is deterministic: same input → same hash
- Proof manifest contains `runtime_contract_version: "EAR_INTERCEPT_v1"`

### 4. Execution Path Absence When STOP

**Critical Guarantee:** When `decision === 'STOP'`, the execution path **does not exist**.

**Code Path Analysis:**

```typescript
// openclaw_adapter.ts - receiveToolCall()

const decision = await evaluateDecision(decisionInput);

if (decision.verdict === 'STOP') {
  // Execution path BLOCKED here
  const proofPath = await logOpenClawDecision(...);

  return {
    decision: 'STOP',
    executed: false,  // ← Execution did NOT occur
    proof_path: proofPath,
    reason: decision.reason
  };

  // NO call to execute() function
  // NO import of execution module
  // NO binding to executor
}
```

**Structural Guarantee:**
- `openclaw_adapter.ts` does NOT import any execution module
- `receiveToolCall()` does NOT call any `execute()` function
- STOP verdict → immediate return with `executed: false`

**What does NOT happen when STOP:**
- ❌ No execution function binding
- ❌ No system call
- ❌ No file I/O related to the action
- ❌ No network request related to the action
- ✅ Only proof logging occurs

**Verification Method:**
```bash
# Verify no execution imports in adapter
grep -n "execute" integrations/openclaw/openclaw_adapter.ts
# Expected: No imports, only return { executed: false }

# Verify STOP decisions never execute
cat proof/openclaw_intercept/openclaw_decisions.jsonl | \
  jq 'select(.decision.verdict == "STOP") | .executed'
# Expected: All false
```

## Runtime Contract Version

**Version:** `EAR_INTERCEPT_v1`

This contract version guarantees:
1. External interception (no source modification)
2. Pre-execution STOP enforcement
3. Cryptographic proof per decision
4. Structural absence of execution path when STOP

**Contract Enforcement:** All four guarantees are structurally enforced at the code level, not configurable.
