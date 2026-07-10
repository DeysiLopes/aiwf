---
name: database-proxy
description: "Sets up a local bastion/proxy for agents to query target databases (dev/staging) in read-only mode, WITHOUT exposing the database or pasting credentials in chat. Use during specification/plan/QA when needing to validate contracts, check real records, or build test cases. Opens tunnel to database, reads credentials from secret manager, and exposes POST /query read-only by default. Trigger with: 'query the service database', 'open database bastion', 'run query in dev/staging', 'see real record'."
argument-hint: "engine (mysql|postgresql|dynamodb), secret name in secret manager and (relational) instance-id + endpoint"
---

# Database Proxy (read-only database access via tunnel + secret manager)

## When to Use

When the agent needs to **look at real data in dev/staging** during workflow — validate a contract, check a record, build a test case — **without** exposing the database publicly and **without** anyone pasting credentials in chat. It's the "bastion host to connect to database," adapted for the workflow.

> **Not** for production and **doesn't** replace official access. It's an assisted reading tool for specification/plan/testing/review phases.

## Principle

Credentials come from **secret manager** (by secret name), the database stays behind a **tunnel** (no public port), and the proxy is **read-only by default**.

## Inputs

- **Engine**: `mysql`, `postgresql`, or `dynamodb` (via role/environment credential).
- **`DB_SECRET_NAME`**: name/ARN of secret in secret manager with database credential.
- **(Relational)** instance-id of bastion + `endpoint` of database (to open tunnel).
- **AWS_REGION** (default varies by organization).

## Output

- Local HTTP proxy on `127.0.0.1:8090` with:
  - `GET /health` — connection status.
  - `POST /query` — executes query and returns JSON (`{type, data, columns, rowCount}`).
- No secrets on disk/log: credential lives only in memory, from secret manager.

## Procedure

1. **Prerequisites**: `pip install -r requirements.txt` (database drivers, flask, waitress) and valid cloud credentials for target service account.
2. **(Relational) Open tunnel** to database (without exposing database):
   ```bash
   aws ssm start-session --target <instance-id> \
     --document-name AWS-StartPortForwardingSessionToRemoteHost \
     --parameters host="<db-endpoint>",portNumber="<port>",localPortNumber="<port>"
   ```
3. **Start proxy** reading secret (read-only by default):
   ```bash
   DB_SECRET_NAME=<secret-name> AWS_REGION=<region> ENGINE=mysql \
     python db-proxy.py --port 8090
   ```
   For DynamoDB: `ENGINE=dynamodb` (tunnel not needed; uses environment role/credential).
4. **Query**:
   ```bash
   # MySQL/PostgreSQL
   curl -s localhost:8090/query -H 'Content-Type: application/json' \
     -d '{"sql":"SELECT * FROM contracts LIMIT 5"}'
   # DynamoDB (PartiQL)
   curl -s localhost:8090/query -H 'Content-Type: application/json' \
     -d '{"statement":"SELECT * FROM \"Table\" WHERE pk = ?","parameters":[{"S":"KEY#123"}]}'
   ```
5. **Shutdown**: stop proxy (Ctrl-C) and tunnel session when done.

## Guardrails

- **Read-only by default**: only `SELECT`/`SHOW`/`DESCRIBE`/`EXPLAIN`/`WITH` (relational) and `SELECT` PartiQL (DynamoDB). Any DML/write returns **403** unless `ALLOW_WRITES=true` is set **explicitly** — and even then, confirm with user first.
- **Credentials only from secret manager** — **never** hardcode, **never** commit secret/host/port. Always reference by **secret name**.
- **No public port**: relational databases only via **tunnel** (`localhost`); don't open database to internet.
- **Only dev/staging** for workflow; production requires official process.
- Bind to `127.0.0.1` (not `0.0.0.0`): proxy doesn't listen outside user's machine.

- **Respond in English.** All output must be in English.
## Next Step

Use data to enrich specification/plan (real contracts/rules) or build test cases.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.

