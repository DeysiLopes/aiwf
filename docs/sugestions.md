# Sugestões — AI Workflow Engine

---

## Sessão: Refinamento da ideia (2026-07-08)

### Contexto levantado
- **Uso principal**: pessoal primeiro, depois open source para a comunidade.
- **Ponto de entrada do fluxo**: começa como orquestrador recebendo uma User Story.
- **Integração com LLM**: híbrida — chama API diretamente quando possível, delega para CLI (Claude Code, Gemini CLI) quando necessário.
- **Maiores riscos identificados**: escopo grande demais para um MVP + complexidade técnica das integrações.

---

### Sugestão 1 — Estratégia do Vertical Slice para o MVP

Em vez de construir todas as camadas horizontais de uma vez (Core, Skills, Plugins, FinOps...),
construa um **corte vertical** que prove o valor do conceito de ponta a ponta:

```
User Story (texto)
       ↓
  [Workflow Engine MVP]
       ↓
  Chama LLM (API direta ou CLI externa)
       ↓
  Gera specification.md + plan.md
       ↓
  Salva artefatos localmente
```

Esse MVP já demonstra as três ideias centrais sem precisar de tudo pronto:
- Workflow como código (um YAML simples)
- Artifact Manager (arquivos gerados)
- Skill Engine mínimo (duas skills: specification + planning)

---

### Sugestão 2 — Definir o "kernel" antes de tudo

Antes de qualquer código, definir com clareza o que é o **núcleo irredutível** do Workflow Engine:

> "O que ele precisa fazer para eu chamar de Workflow Engine e não de script?"

Candidatos para o kernel:
- Ler um workflow.yaml e saber em qual etapa está
- Descobrir qual skill produz cada artefato
- Saber se o artefato já existe (e pular a etapa)
- Chamar o LLM e salvar o resultado como artefato

Tudo que vai além disso (FinOps, Plugins, MCP Registry, Event Bus, Scheduler) é extensão — pode vir depois.

---

### Sugestão 3 — Ordem de construção recomendada

```
Fase 1 — Kernel
  ├── workflow.yaml reader
  ├── skill resolver (quem produz o quê)
  ├── artifact manager (existe? pula. não existe? executa.)
  └── LLM caller (API direta, um modelo só)

Fase 2 — Usabilidade
  ├── CLI mínima (aiwf run STORY-123)
  ├── Context Manager básico (quais arquivos entram no prompt)
  └── Estado persistido (saber onde pausou)

Fase 3 — Extensibilidade
  ├── Plugin Registry
  ├── MCP Registry
  └── Event Bus

Fase 4 — Governança
  └── FinOps Manager (estimativa local + providers)
```

---

### Sugestão 4 — Pergunta aberta importante (ainda sem resposta)

> Como o Engine vai saber quando **pausar e esperar o usuário** vs. **continuar automaticamente**?

Isso é o coração do Scheduler. Precisaria definir:
- O que dispara uma pausa? (ex: skill de "clarification" sempre pausa)
- Como o usuário retoma? (ex: `aiwf resume STORY-123`)
- O estado é salvo onde? (arquivo local, SQLite, JSON?)

Vale desenhar isso antes de codificar o Scheduler.

---

## Sessão: Rascunho do workflow.yaml (2026-07-08)

### Draft — `workflow.yaml`

```yaml
# workflow.yaml — AI Workflow Engine (MVP Draft)
id: STORY-001
name: "Criar módulo de autenticação"
description: >
  User Story de entrada. O Engine vai processar cada etapa
  em sequência, pulando as que já têm artefato gerado.

# Diretório raiz onde todos os artefatos serão salvos
artifacts_dir: ./artifacts/STORY-001

steps:
  - id: specification
    name: "Gerar Especificação"
    skill: skills/specification.md        # skill que define o prompt e o comportamento
    input:
      - user_story: "{{workflow.description}}"  # injeta a descrição da Story
    output:
      artifact: specification.md          # artefato que esta etapa produz
    on_existing: skip                     # se o artefato já existe, pula esta etapa

  - id: planning
    name: "Gerar Plano de Execução"
    skill: skills/planning.md
    input:
      - specification: "{{artifacts.specification}}"  # usa o artefato da etapa anterior
    output:
      artifact: plan.md
    on_existing: skip

  - id: review
    name: "Revisão Humana"
    type: human_pause                     # tipo especial: pausa e aguarda o usuário
    prompt: >
      Revise os artefatos gerados em ./artifacts/STORY-001.
      Quando estiver pronto, execute: aiwf resume STORY-001
    depends_on:
      - planning                          # só pausa depois que planning terminar
```

---

### Decisões de design embutidas no draft

| Conceito | Decisão | Motivo |
|---|---|---|
| `id` da Story | String livre (ex: `STORY-001`) | Fácil de ligar a qualquer sistema de tickets |
| `artifacts_dir` | Centralizado, por Story | Tudo num lugar só, fácil de auditar |
| `skill:` | Caminho para um `.md` | Segue o padrão de mercado (skills como docs) |
| `input:` com `{{...}}` | Template simples | Evita reinventar uma linguagem de template |
| `on_existing: skip` | Padrão por etapa | Idempotência — pode rodar de novo sem retrabalho |
| `type: human_pause` | Etapa especial | Resolve a pergunta aberta da Sugestão 4 |
| `depends_on:` | Dependência explícita | Base para execução paralela no futuro |

---

### Pontos em aberto para lapidar com as skills

- O campo `skill:` aponta para o `.md` — mas o Kernel vai precisar saber **o que extrair** dele (prompt? metadados? parâmetros?)
- O `input:` pode crescer — quando as skills chegarem, ver se precisamos de tipagem (ex: `type: file` vs `type: text`)
- `on_existing` tem apenas `skip` por ora — pode virar `skip | overwrite | ask` depois
