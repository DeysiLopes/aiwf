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

## Estrutura do MVP

- `src/core`: motor do workflow
- `src/cli`: comando `aiwf`
- `skills/`: prompts das skills
- `examples/STORY-001/workflow.yaml`: fluxo de exemplo

## Catalogo de skills

### Esteira principal (ordem de execução)

| # | Skill | Artefato gerado |
|---|---|---|
| 1 | `prompt-builder` | `prompt-inicial.md` |
| 2 | `sdd-specify` | `specification.md` |
| 3 | `sdd-clarify` | `clarification.md` |
| 4 | `sdd-plan` | `plan.md` |
| 5 | `sdd-tasks` | `tasks.md` |
| 6 | `sdd-implement` | `implementation.md` |
| 7 | `sdd-teste` | `teste.md` |
| 8 | `code-reviewr` | `review.md` |
| 9 | `sdd-closer` | `closure.md` |

### Transversais / on-demand

| Skill | Tipo | Chamada por |
|---|---|---|
| `brainstorming-ideacao` | on-demand | `sdd-clarify` |
| `java-arquitetura` | transversal | `code-reviewr` |
| `boas-praticas-engenharia` | transversal | `code-reviewr` |
| `sdd-custo` | transversal/paralela | esteira inteira (atualiza `run-log.md` via MCP) |

### Aliases (compatibilidade com MVP inicial)

- `skills/specification.md` → alias de `sdd-specify`
- `skills/planning.md` → alias de `sdd-plan`
- `skills/tasks.md` → alias de `sdd-tasks`

## Pipeline completo

```
User Story (texto)
       ↓
[prompt-builder]     →  prompt-inicial.md, cria run-log.md
       ↘
 [sdd-custo]         →  atualiza consumo/custo no run-log.md (paralelo via MCP)
       ↓
[sdd-specify]        →  specification.md
       ↓
[sdd-clarify]        →  clarification.md
       ↓
[sdd-plan]           →  plan.md
       ↓
[sdd-tasks]          →  tasks.md
       ↓
[sdd-implement]      →  implementation.md
       ↓
[sdd-teste]          →  teste.md
       ↓
[code-reviewr]       →  review.md
       ↓
[ human_pause ]      ←  revisão humana
       ↓
[sdd-closer]         →  closure.md, finaliza run-log.md
```

O `run-log.md` é consolidado automaticamente pelo motor a cada etapa,
extraindo as seções `## Seed do run-log` (prompt-builder) e `## Run Log Update`
(demais skills) de cada artefato gerado.

## Execução

Rodar sem chamar modelo (gera artefatos simulados):

```bash
aiwf run STORY-001 --dry-run --workflow-dir examples
```

Rodar com OpenAI:

```bash
export OPENAI_API_KEY=seu_token
aiwf run STORY-001 --model gpt-4o-mini --workflow-dir examples
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
