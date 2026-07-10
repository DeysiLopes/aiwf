---
name: proxy-configuration
description: "Corporate proxy configuration for external network access (pip/uv/npm/git/curl) and CLI tools. Authentication with current user's credential (never hardcoded). Use before any installation or command that touches external network."
---

# Corporate Proxy Configuration

Use these configurations to access internet from agent machine and browser, and for any `pip`/`uv`/`npm`/`git push`/`curl` that touches external network.

## Environment Variables

```bash
export http_proxy="http://proxy.example.com:8080"
export https_proxy="http://proxy.example.com:8080"
export no_proxy="127.0.0.1,127.0.0.1:4200,localhost,::1,.localhost"
```

## pip / uv (with proxy + trusted hosts when needed)

```bash
http_proxy="http://proxy.example.com:8080" https_proxy="http://proxy.example.com:8080" \
  pip install -r requirements.txt \
  --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

## CLI Tools (registry in corporate artifact repository)

```bash
npm install -g --registry=https://artifactory.example.com/api/npm/npm-release/ @tool/cli@latest --strict-ssl=false
```

## Authentication — **credential is current user's** (no fixed identity)

No functional team credential for workflow. Each person authenticates with **their own** credentials. Agent should **request current user's credentials** at runtime and use them only to configure access to artifact repository/CLI:

```bash
# agent ASKS user for their credentials (never hardcode, never commit)
npm config set //artifactory.example.com/api/npm/npm-release/:_auth "$(printf '%s:%s' "$USER" "$PASSWORD" | base64)"
# (or `npm login --registry=...` providing user/password when requested)
```

**Security rules (mandatory):**
- Ask for credentials **securely** (prompt/secret) **every time**; **never** fix in repo or in registry file.
- The config file with credential stays **local** — ensure it's in `.gitignore` and **never** committed.
- Replace credential with **token** when artifact repository makes it available (preferable to password).

## Notes

- Proxy is **mandatory** for external network in corporate environment.
- Don't disable TLS verification except when official procedure requires it.
- Internal endpoints may need to be added to `no_proxy` as needed.

## Guardrails

- **Respond in English.** All output must be in English.

## Installation

Install according to your organization's AI assistant CLI and deployment processes.