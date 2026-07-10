# AI Workflow Engine CLI (MVP)

CLI em Node.js + TypeScript para executar workflows orientados por skills e gerar artefatos.

## Requisitos

- Node.js 20+
- npm


## Instalação

```bash
npm install
npm run build
npm link
```

## Estrutura do projeto

- `src/core`: motor do workflow
- `src/cli`: comando `aiwf`
- `skills/`: skills (agnósticas em inglês em `skills/<nome>/SKILL.md`)
- `(finops movido para ideias/finops — backlog)`
- `workflows/`: definições de workflow YAML de exemplo
- `docs/`: diagramas e documentação complementar

## Catalogo de skills

### Skills da esteira principal (ordem de execução)

| # | Skill (Agnóstica) | Artefato gerado | Equivalente legado |
|---|---|---|---|---|
| 1 | `workflow-kickoff` | `prompt-inicial.md`, seed run-log | `prompt-builder` |
| 2 | `verify-install` | `verify-report.md` | — |
| 3 | `git-flow` (setup) | `git-setup.md` | — |
| 4 | `specify` | `specification.md` | `sdd-specify` |
| 5 | `clarify` | `clarification.md` | `sdd-clarify` |
| 6 | `plan` | `plan.md` | `sdd-plan` |
| 7 | `tasks` | `tasks.md` | `sdd-tasks` |
| 8 | `implement` | `implementation.md` | `sdd-implement` |
| 9 | `test` | `teste.md` | `sdd-teste` |
| 10 | `code-reviewer` | `review.md` | `code-reviewr` |
| 11 | `closer` | `closure.md` | `sdd-closer` |
| 12 | `ci-monitor` | `ci-report.md` | — |

### Skills transversais / on-demand

| Skill | Tipo | Chamada por |
|---|---|---|
| `brainstorming` | ideação pré-especificação | `workflow-kickoff`, `specify` |
| `cloud-solution-architect` | arquitetura cloud | `plan`, `code-reviewer` |
| `engineering-best-practices` | boas práticas | `code-reviewer` |
| `domain-review` | validação opcional | `plan`, `code-reviewer` |
| `clean-code-review` | revisão qualidade | `code-reviewer` |
| `java-architecture` | validação Java | `code-reviewer` |
| `hexagonal-ddd-structure` | validação DDD | `domain-review` |
| `exception-handling` | padrão erro | `code-reviewer` |
| `api-conventions` | contrato API | `code-reviewer` |
| `git-flow` | branch/commit/PR | transversal |
| `observability-patterns` | observabilidade | `code-reviewer` |
| `ai-cost-manager` | custo IA (via MCP) | esteira inteira |
| `requirements-fetch` | fetch requisitos | `workflow-kickoff` |
| `artifact-builder` | meta-skill para contribuir artefatos | (manual) |
| `chaos-validation` | resiliência pós-deploy | pós-`ci-monitor` |
| `database-proxy` | acesso DB seguro | `implement` |
| `local-spring-run` | execução local Spring | `implement` |
| `proxy-configuration` | proxy corporativo | (setup) |

## Pipeline completo

```
User Story (texto)
       ↓
[workflow-kickoff]        →  prompt-inicial.md, seed do run-log
       ↓
[verify-install]          →  verify-report.md, atualiza run-log
       ↓
[git-setup]               →  git-setup.md, atualiza run-log
       ↓
[specify]                 →  specification.md, atualiza run-log
       ↓
[clarify]                 →  clarification.md, atualiza run-log
       ↓
[plan]                    →  plan.md, atualiza run-log
       ↓
[tasks]                   →  tasks.md, atualiza run-log
       ↓
[implement]               →  implementation.md, atualiza run-log
       ↓
[test]                    →  teste.md, atualiza run-log
       ↓
[code-reviewer]           →  review.md, atualiza run-log
       ↓
[ human_pause ]           ←  revisão humana
       ↓
[closer]                  →  closure.md, atualiza run-log
       ↓
[ci-monitor]              →  ci-report.md, atualiza run-log
```

O `run-log.md` é consolidado automaticamente pelo motor a cada etapa.

## Configuração do provedor AI

### Opencode Zen (padrão)

Coloque sua chave no arquivo `~/.config/opencode/.env`:

```env
OPENCODE_API_KEY=sk-...
```

O `aiwf` lê esse arquivo automaticamente ao iniciar. Modelo padrão: `big-pickle`.

```bash
aiwf run STORY-001
aiwf run STORY-001 --model gpt-5.3-codex
aiwf run STORY-001 --provider zen --model big-pickle
aiwf run STORY-001 --dry-run --workflow-dir examples
```

### OpenAI (alternativo)

```bash
export OPENAI_API_KEY=seu_token
aiwf run STORY-001 --provider openai --model gpt-4o-mini
```

### Dry-run (sem chamar modelo)

```bash
aiwf run STORY-001 --dry-run --workflow-dir examples
```

Após pausa para revisão humana, retomar:

```bash
aiwf resume STORY-001 --workflow-dir examples
```

Arquivos gerados:

```text
artifacts/STORY-001/
├── prompt-inicial.md
├── specification.md
├── clarification.md
├── plan.md
├── tasks.md
├── implementation.md
├── teste.md
├── review.md
├── closure.md
└── run-log.md
```
