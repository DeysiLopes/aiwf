---
name: chaos-validation
description: "Automated post-deployment validation using chaos engineering. Executes progressive resilience tests to validate system resilience after deployments. Use when validating deployment, running chaos tests, executing resilience tests, verifying post-deploy resilience, or mentions terms like 'test the deploy', 'chaos after deploy', 'validate resilience'."
---

# Post-Deploy Chaos Validation

## Workflow

Determine deployment context first:

| Context | Phases to run |
|---------|--------------|
| "validate this deploy / test after deploy" | Phase 1 + 2 + 3 (full resilience test) |
| "quick chaos check / smoke test" | Phase 1 only (conservative runbook) |
| "full resilience audit" | Phase 1 + 2 + 3 + 4 (with report generation) |
| "setup chaos testing" | Phase 0 only (configure chaos MCP) |

### Phase 0 — Setup (if needed)
Check if chaos MCP is configured and authenticated:
1. Verify MCP server is in agent config
2. Call login tool if not authenticated
3. Validate connectivity

If no modeling plan exists, suggest running resilience modeling skill first.

### Phase 1 — Conservative Test
Execute conservative resilience runbook:
1. Check if runbook exists
2. If not found, import from modeling plan
3. Execute conservative runbook
4. Monitor alarm status every 30s
5. Collect report

**Success criteria**: All experiments pass, no alarm triggers, services remain healthy.

**If Phase 1 fails**: Stop here. Report findings, suggest fixes before proceeding.

### Phase 2 — Moderate Test
Same as Phase 1, but with moderate runbook. Increases blast radius and duration.

**Requires**: Phase 1 success OR explicit user override.

### Phase 3 — Aggressive Test
Same as Phase 1, but with aggressive runbook. Maximum chaos intensity.

**Requires**: Phase 2 success OR explicit user override.

### Phase 4 — Report
Generate comprehensive resilience report:
1. Collect all execution logs
2. Generate compliance document with all runbook results
3. Summarize findings: passed experiments, failed experiments, alarm triggers, recovery times

## Quick Validation Pattern

For standard post-deployment validation (most common case):

```
1. Import plan (if first time)
2. Execute Conservative
3. Monitor alarm status (30s intervals, max 10min)
4. Report results
5. If success → Moderate → Aggressive (optional)
6. Generate compliance document
```

## Golden Rules

1. **Progressive Execution** — Always start conservative, never jump to aggressive without passing moderate
2. **Alarm Monitoring** — Check alarm status every 30s during execution; abort if triggered
3. **Dry Run First** — Preview before actual execution
4. **Environment Safety** — Never run aggressive in production without explicit approval; prefer dev/staging
5. **Blast Radius Awareness** — Conservative = small scope, Moderate = medium scope, Aggressive = full service
6. **Recovery Validation** — After each experiment, verify service recovered to baseline metrics
7. **Compliance Document** — Always generate compliance document for production tests

## MCP Tools Used

| Tool | Phase | Purpose |
|------|-------|---------|
| `login` | 0 | Authentication |
| `list_accounts` | 0 | Validate connectivity |
| `import_modeling_plan` | 0-1 | Import experiments from modeling skill |
| `list_runbooks` | 1-3 | Check existing tests |
| `execute_runbook` | 1-3 | Start chaos experiments |
| `get_alarm_status` | 1-3 | Monitor abort conditions |
| `get_runbook_report` | 1-4 | Collect results |
| `get_execution_logs` | 4 | Detailed logs |
| `generate_compliance_doc` | 4 | Compliance document |
| `discover_targets` | 0 | Find available targets (if needed) |

## Output Format

After each test execution, report:

```
## Resilience Test Results: <Runbook Name>

Level: [Conservative | Moderate | Aggressive]
Status: [✓ Passed | ✗ Failed | ⚠ Partial]
Duration: <execution time>

Experiments Executed:
- <experiment name>: [✓ | ✗] — <brief result>

Alarms Triggered:
- <alarm name>: <threshold> at <timestamp>

Recovery Metrics:
- Service availability: <percentage>
- Mean recovery time: <seconds>
- Max observed latency: <ms>

Next Steps:
- [Proceed to next level | Fix issues | Generate compliance document]
```

## Safety Checks

Before executing aggressive tests:

1. ✓ Environment is not production OR user explicitly approved
2. ✓ Conservative and moderate levels passed
3. ✓ Monitoring dashboards are accessible
4. ✓ Rollback plan is defined
5. ✓ Stakeholders are notified (for prod)

If any check fails, prompt user before proceeding.

## Guardrails

- **Respond in English.** All output must be in English.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.