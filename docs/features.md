# Features — AI Workflow Engine

> **Contexto atualizado (2026-07-08)**
> As skills da esteira principal e transversais já existem como arquivos `.md`.
> Isso muda o foco do MVP: não é mais "provar o conceito" — é **entregar valor real no primeiro run**.

---

## 🎯 Feature #1 — "Rodar a esteira completa de uma Story"

### O que é

O usuário executa:

```
aiwf run STORY-001
```

O Engine lê o `workflow.yaml`, percorre cada step em sequência,
carrega a skill correspondente, monta o prompt, chama o LLM e salva cada artefato.
Se um artefato já existe (`on_existing: skip`), o step é pulado.

Ao final, o usuário tem, na pasta `artifacts/STORY-001/`:

```
specification.md
plan.md
tasks.md
```

---

### Por que esta feature — e não uma menor

| Alternativa | Por que não é suficiente |
|---|---|
| Só o step `specification` | Skills já existem — não precisamos provar o conceito, precisamos usar |
| Só CLI sem motor | Interface sem resultado não entrega valor |
| Motor sem CLI | Usar via `python engine.py` não é produto — é protótipo |
| Parar antes do `tasks.md` | O plano sem as tasks não fecha o ciclo do desenvolvedor |

**O raciocínio:** com as skills prontas, o motor tem tudo que precisa para
percorrer a esteira do início ao fim. Fazer só um step seria subentrega —
é como construir um carro e deixar ele parado com uma roda faltando.

---

### O ciclo que a Feature #1 cobre

```
aiwf run STORY-001
        ↓
 [ler workflow.yaml]
        ↓
 ┌─────────────────────────────────┐
 │  Para cada step do workflow:    │
 │                                 │
 │  ① artefato existe? → skip      │
 │  ② carregar skill (.md)         │
 │  ③ injetar variáveis {{...}}    │
 │  ④ chamar LLM                   │
 │  ⑤ salvar artefato              │
 └─────────────────────────────────┘
        ↓
 artifacts/STORY-001/
   ├── specification.md ✓
   ├── plan.md          ✓
   └── tasks.md         ✓
```

---

### Definition of Done (o que "funciona bem" significa)

**Motor:**
- [ ] Lê `workflow.yaml` e descobre os steps na ordem certa
- [ ] Para cada step: carrega o `.md` da skill apontada em `skill:`
- [ ] Injeta variáveis `{{workflow.description}}` e `{{artifacts.nome}}` no prompt
- [ ] Chama o LLM (um modelo, uma API — sem abstração prematura)
- [ ] Salva o resultado em `artifacts_dir/{artifact_name}`
- [ ] Se o artefato já existe, pula o step sem chamar o LLM
- [ ] Passa o artefato de um step como input do próximo (encadeamento)

**CLI mínima (só o necessário para usar):**
- [ ] `aiwf run STORY-001` — executa o workflow do zero (ou retoma do ponto parado)
- [ ] Output honesto no `stdout`: qual step está rodando, qual pulou, qual salvou

**Qualidade:**
- [ ] Na segunda execução do mesmo comando, nenhum step é re-executado (idempotência)
- [ ] Se a execução for interrompida no meio, o próximo `aiwf run` retoma do step correto

---

### O que fica fora desta feature (explicitamente)

| Item | Motivo |
|---|---|
| `human_pause` / `aiwf resume` | Requer state machine — entrega depois |
| FinOps / custo estimado | Governança vem depois que o motor estiver rodando |
| Plugin Registry | Extensibilidade — as skills já resolvem por arquivo |
| Context Manager avançado | Context simples (todo o artefato anterior) serve para o MVP |
| MCP integrations | Ferramentas externas são Fase 3+ |
| Múltiplos modelos / estratégia de LLM | Um modelo funcionando bem > seleção prematura |
| `on_existing: overwrite \| ask` | Só `skip` — YAGNI |
| Dashboard / UI | CLI é suficiente para o MVP |

---

## Features futuras (backlog priorizado)

### Fase 2 — Controle de execução

**Feature #2 — `human_pause` + `aiwf resume`**
O Engine pausa em steps do tipo `human_pause` e persiste o estado.
O usuário revisa os artefatos e retoma com `aiwf resume STORY-001`.
Resolve a pergunta aberta de "como o Engine sabe quando pausar".

---

**Feature #3 — Estado persistido entre sessões**
O Engine salva o estado de execução (qual step concluiu, quais pulou)
em um arquivo de estado local (ex: `.aiwf/state/STORY-001.json`).
Permite retomada segura após crash, reboot ou interrupção voluntária.

---

### Fase 3 — Governança

**Feature #4 — FinOps local**
Toda chamada ao LLM registra modelo, tokens de entrada/saída e custo estimado.
Relatório por story (`aiwf finops STORY-001`) e por sprint.
Não depende de API externa — o Engine controla a contabilidade.

---

**Feature #5 — Context Manager**
Controla quais artefatos entram no prompt de cada step.
Permite resumir, truncar ou usar cache para economizar tokens.
Relevante quando os artefatos crescerem além de poucos KB.

---

### Fase 4 — Extensibilidade

**Feature #6 — Plugin Registry**
Skills e MCPs descobertos dinamicamente via pasta `plugins/`.
Instalar um plugin: `aiwf plugin install spring`.
A base para tornar o Engine uma plataforma open source.

**Feature #7 — MCP integrations**
Conectar ao Git, GitHub, Jira, etc. via Model Context Protocol.
O Engine deixa de ser só "gerador de artefatos" e passa a agir no repositório.

**Feature #8 — Múltiplos LLMs / Strategy**
Seleção de modelo por step: `preferred_model: normal | concise | economic`.
Permite balancear qualidade e custo por tipo de tarefa.

---

## Resumo visual do roadmap

```
Feature #1 — MVP (entregar agora)
└── aiwf run STORY-001
       ├── Lê workflow.yaml
       ├── Encadeia steps com skills existentes
       ├── Salva artefatos (specification, plan, tasks)
       ├── Skip se já existe (idempotência)
       └── CLI mínima para usar

Feature #2 — human_pause + resume
Feature #3 — Estado persistido
Feature #4 — FinOps local
Feature #5 — Context Manager
Feature #6 — Plugin Registry
Feature #7 — MCP integrations
Feature #8 — Múltiplos LLMs
```

---

*Atualizado em 2026-07-08 — contexto: skills da esteira e transversais já prontas.*
