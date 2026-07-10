---
name: local-spring-run
description: "Starts a Spring Boot service (BFF or backend) locally for validation before testing/pipeline, without secrets in body. Use in implementation/QA phase when wanting to 'run locally and validate' a BFF/backend: configures Java, truststore with internal CAs, corporate proxy, env vars by name (STS/URLs) and validates via curl/Swagger. Parameterized by role: bff (no database/cache → no tunnel) or backend (needs tunnel). Trigger with: 'start service locally', 'run BFF/backend locally', 'validate locally before pipeline'."
argument-hint: "Role (bff|backend), module path (app/pom.xml) and target environment for dependencies (dev|staging)"
---

# Local Spring Boot Startup (BFF / Backend) — Generic

## When to Use

In **implementation/QA** phase, to **run locally and validate** (curl/Swagger) before pushing to testing in CI pipeline — reduces back-and-forth in pipeline. Generic: works for any Spring service.

## Principle (no secrets in body)

All secrets come via **env var (by name)** from **secret manager** or user's vault; skill body only has **placeholders**. Proxy and certificates refuse artifacts that already exist.

## Role: BFF vs Backend

| Role | Needs tunnel? | Why |
|---|---|---|
| **bff** | **No** | no database or cache locally; only calls STS + backend (via proxy) |
| **backend** | **Yes** | accesses database — open tunnel with database proxy skill before starting |

## Prerequisites

1. **Java** in service version (ex.: 21) — `JAVA_HOME` pointing to it.
2. **Maven** + `settings.xml` from artifact repository (setup of container/devcontainer — outside this skill's scope).
3. **Truststore** with **internal CAs** — without this, STS/internal APIs break on TLS.
4. **Corporate proxy** accessible for STS and internal domains.
5. **(backend)** Tunnel open via database proxy skill.

## Env Vars (by name — never value in repo)

| Variable | Source | Description |
|---|---|---|
| `STS_URL` | environment/secret manager | STS URL of target environment |
| `STS_CLIENT_ID` | **secret manager** | STS client id |
| `STS_CLIENT_SECRET` | **secret manager** | STS client secret — **never** in command/repo |
| `<APP>_BACKEND_URL` | environment table | Backend URL or `http://localhost:<port>` |
| `<APP>_API_KEY` | local placeholder | Any UUID for local (ex.: `00000000-0000-0000-0000-000000000000`) |

> Export secrets from secret manager, don't write them.

## JVM Args (truststore + proxy)

| Argument | Reason |
|---|---|
| `-Djavax.net.ssl.trustStore=$TRUSTSTORE_PATH` | truststore with internal CAs |
| `-Djavax.net.ssl.trustStorePassword=$TRUSTSTORE_PASS` | truststore password (default `changeit`, via env) |
| `-Dhttps.proxyHost=$PROXY_HOST -Dhttps.proxyPort=$PROXY_PORT` | corporate proxy |
| `-Dhttp.nonProxyHosts=localhost` | don't use proxy for local calls |

## Command (copy/paste — placeholders)

```bash
cd <module>/app
export JAVA_HOME="<java-home-of-version>"
# secrets from secret manager (example with CLI; adjust secret/keys):
export STS_CLIENT_ID=$(aws secretsmanager get-secret-value --secret-id <secret-sts> --query SecretString --output text | python3 -c "import sys,json;print(json.load(sys.stdin)['client_id'])")
export STS_CLIENT_SECRET=$(aws secretsmanager get-secret-value --secret-id <secret-sts> --query SecretString --output text | python3 -c "import sys,json;print(json.load(sys.stdin)['client_secret'])")
export STS_URL=<sts-url-of-environment>
export APP_BACKEND_URL=<backend-url-or-localhost>
export APP_API_KEY=00000000-0000-0000-0000-000000000000

mvn spring-boot:run -Dspring-boot.run.jvmArguments="\
  -Djavax.net.ssl.trustStore=$TRUSTSTORE_PATH \
  -Djavax.net.ssl.trustStorePassword=${TRUSTSTORE_PASS:-changeit} \
  -Dhttps.proxyHost=$PROXY_HOST -Dhttps.proxyPort=$PROXY_PORT \
  -Dhttp.nonProxyHosts=localhost"
```

## Validation

```bash
curl -s http://localhost:<port>/actuator/health      # expected: {"status":"UP"}
# Swagger: http://localhost:<port>/swagger-ui.html
curl -s http://localhost:<port>/<context>/v1/<resource> -H "correlationID: test-local-001"
```

## Procedure

1. Identify **role** (bff/backend) and module (`app/pom.xml`).
2. Ensure prerequisites (Java, truststore/certs, proxy; **backend** → tunnel).
3. Export env vars **from secret manager** (by name).
4. `mvn spring-boot:run` with truststore/proxy JVM args.
5. Validate `actuator/health` + endpoint via curl/Swagger.
6. Register in run log that validated locally before testing.

## Guardrails

- **Zero secrets in body/versioned command** — only placeholders + secret manager. Never commit `application-local.yml` with secrets.
- **No PKIX/TLS error** = truststore with internal CAs loaded.
- **bff doesn't open tunnel**; **backend** opens via database proxy.
- Reuse proxy configuration (don't duplicate proxy config here).

- **Respond in English.** All output must be in English.
## Next Step

Validated locally → proceed to functional testing and code review.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.

