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

## Execução

Rodar sem chamar modelo (gera artefatos simulados):

```bash
aiwf run STORY-001 --dry-run
```

Rodar com OpenAI:

```bash
export OPENAI_API_KEY=seu_token
aiwf run STORY-001 --model gpt-4o-mini
```

Arquivos gerados:

```text
artifacts/STORY-001/specification.md
artifacts/STORY-001/plan.md
artifacts/STORY-001/tasks.md
```
