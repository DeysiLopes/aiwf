---
name: api-conventions
description: "OpenAPI contract validation rules for API gateways, to avoid trial-and-error cycles in publication. Use when defining/altering API contract (planning), when reviewing PR contract (review), or when gateway pipeline rejects schema (schema errors, response errors, example errors). Covers base schema on path singular, wrapper {data}, required examples, and camelCase. Trigger with: 'validate gateway contract', 'API gateway rules', 'schema error in gateway pipeline', 'review OpenAPI'."
argument-hint: "Path to OpenAPI file (ex.: openapi.yml) or contract snippet to validate"
---

# API Conventions for OpenAPI

## When to Use

- In **planning** phase (API contracts section), when defining/altering an OpenAPI contract.
- In **review** phase (code reviewer), to check if contract follows gateway rules.
- When **API gateway pipeline rejects** schema (schema errors, response errors, example errors).

Knowing these rules **before** push avoids error cycles in gateway pipeline.

## Required Rules (most common rejections)

### 1. Required base schema (`schema-003`)
Every route needs a **base schema** in `components.schemas` named as the **singular of the path**, in `camelCase`. Request/response schemas reference or extend this base.

```yaml
# Route: /contracts  → base schema: contract (singular, camelCase)
components:
  schemas:
    contract:
      type: object
      properties:
        contractCode: { type: string }
```

### 2. Wrapper `{ data }` in response (`response-002` / `response-003`)
Responses **don't** return schema directly — always inside `{ data: ... }`.

```yaml
responses:
  '200':
    content:
      application/json:
        schema:
          type: object
          properties:
            data: { $ref: '#/components/schemas/contract' }
          required: [data]
```

### 3. Required examples (`example-002`)
Request body and response of **POST/PUT/PATCH/DELETE** need **named examples** with **realistic** values (not `string`/placeholder).

```yaml
requestBody:
  content:
    application/json:
      schema: { $ref: '#/components/schemas/contractRequest' }
      examples:
        contractPostRequest:
          summary: Creation example
          value: { personIdCode: 'abc-123' }
```

## Naming Convention

| Element | Pattern | Example |
|---|---|---|
| Base schema | singular of path, camelCase | `contract` |
| Request schema | base + `Request` | `contractRequest` |
| Request example | base + `Post/Put` + `Request` | `contractPostRequest` |
| Response example | base + `Post/Put` + `Response` | `contractPostResponse` |
| Properties | `camelCase` | `contractCode`, `inclusionDate` |

## Pre-push Checklist (add to PR / run log)

- [ ] Base schema exists in `components.schemas` with **path singular** (camelCase).
- [ ] Every response uses wrapper `{ data: $ref baseSchema }` (and `data` in `required`).
- [ ] **Named** examples for request body and response of POST/PUT/PATCH/DELETE.
- [ ] Example values are **realistic** (no `string`/placeholder).
- [ ] Properties in `camelCase`.
- [ ] Error codes defined (400/404/409/5xx) with schema/example.

## Guardrails

- **Generic by design**: don't couple to any specific service/silo — use the singular of the contract path in question.
- **Don't** invent gateway rule not listed here; if pipeline rejects for new rule, register in run log and propose skill update.
- No credentials/host in example contract.

- **Respond in English.** All output must be in English.
## Installation

Install according to your organization's AI assistant CLI and deployment processes.

## Integration

- Planning → API contracts section: run checklist when designing contract.
- Code reviewer → "contract matches gateway rules" item.

