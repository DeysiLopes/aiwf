# Plano de Construção — AI Workflow Engine CLI

> **Decisão de tecnologia:** TypeScript + Node.js
> **Motivo:** ecossistema de IA já usa Node (Claude Code, Gemini CLI, MCPs, VS Code).
> Instalação simples via `npm install -g aiwf`. Sua experiência com Java vai te ajudar
> na disciplina de arquitetura — TypeScript tem tipagem forte o suficiente para isso.

---

## Visão do que será entregue (Feature #1)

```
aiwf run STORY-001
        ↓
 specification.md  →  plan.md  →  tasks.md
```

Sem plugins. Sem FinOps. Sem `human_pause`. Só o motor rodando a esteira com as skills que já existem.

---

## Estrutura de pastas do projeto

```
aiwf/
├── src/
│   ├── cli/
│   │   └── index.ts          ← entry point: aiwf run / aiwf resume
│   ├── core/
│   │   ├── engine.ts         ← orquestra os steps
│   │   ├── workflow-reader.ts ← lê e valida o workflow.yaml
│   │   ├── skill-loader.ts   ← carrega o .md da skill
│   │   ├── template-engine.ts ← resolve {{variáveis}} no prompt
│   │   ├── artifact-manager.ts ← salva / verifica / pula artefatos
│   │   └── llm-caller.ts     ← chama a API do LLM
│   └── types/
│       └── workflow.types.ts ← interfaces TypeScript do workflow.yaml
│
├── skills/                   ← suas skills .md já existentes ficam aqui
├── examples/
│   └── STORY-001/
│       └── workflow.yaml     ← exemplo para testar
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Passo a Passo

### Passo 1 — Setup do projeto TypeScript

**O que fazer:**
- Inicializar o repositório com `npm init`
- Configurar TypeScript com `tsconfig.json`
- Instalar dependências mínimas:
  - `commander` — para parsear `aiwf run STORY-001` (biblioteca padrão de CLI em Node)
  - `js-yaml` — para ler o `workflow.yaml`
  - `@anthropic-ai/sdk` ou `openai` — SDK do LLM escolhido
- Configurar `package.json` com `bin: { "aiwf": "./dist/cli/index.js" }`

**Critério de done:**
`aiwf --version` retorna a versão sem erro.

---

### Passo 2 — Tipos TypeScript do `workflow.yaml`

**O que fazer:**
Antes de escrever qualquer lógica, definir as interfaces em `workflow.types.ts`:

```typescript
interface Workflow {
  id: string
  name: string
  description: string
  artifacts_dir: string
  steps: Step[]
}

interface Step {
  id: string
  name: string
  skill: string
  input: Record<string, string>
  output: { artifact: string }
  on_existing: 'skip' | 'overwrite'
}
```

**Por que fazer isso antes:** com Java você já sabe — definir o modelo de dados primeiro evita refatorações dolorosas depois.

**Critério de done:**
`workflow.yaml` do exemplo carrega sem erros de tipagem.

---

### Passo 3 — Workflow Reader

**O que fazer:**
Criar `workflow-reader.ts` que:
- Lê o arquivo `workflow.yaml` do caminho passado
- Valida os campos obrigatórios (`id`, `steps`, `artifacts_dir`)
- Retorna um objeto `Workflow` tipado

**Critério de done:**
`workflowReader.load('./examples/STORY-001/workflow.yaml')` retorna o objeto correto
e lança erro descritivo se o YAML estiver malformado.

---

### Passo 4 — Skill Loader

**O que fazer:**
Criar `skill-loader.ts` que:
- Recebe o caminho do `.md` (campo `skill:` do step)
- Lê o conteúdo do arquivo
- Extrai o bloco de prompt (pode ser o corpo inteiro do `.md` por enquanto)

**Critério de done:**
`skillLoader.load('skills/specification.md')` retorna o texto do prompt pronto para uso.

---

### Passo 5 — Template Engine

**O que fazer:**
Criar `template-engine.ts` que resolve as variáveis `{{...}}` no prompt:

- `{{workflow.description}}` → description do workflow
- `{{artifacts.specification}}` → conteúdo do arquivo `specification.md` já gerado

**Critério de done:**
Dado um prompt com `{{workflow.description}}` e um contexto com a description,
retorna o prompt com o valor substituído corretamente.

> ⚠️ **Armadilha comum:** não reinventar uma linguagem de template. Começa com
> `string.replace()` simples — só adiciona complexidade quando o caso exigir.

---

### Passo 6 — Artifact Manager

**O que fazer:**
Criar `artifact-manager.ts` que:
- `exists(artifactPath)` → verifica se o arquivo já existe
- `read(artifactPath)` → retorna o conteúdo de um artefato existente
- `save(artifactPath, content)` → salva o conteúdo, criando diretórios se necessário

**Critério de done:**
- `save()` cria o arquivo com o conteúdo correto
- `exists()` retorna `true` após o `save()`
- `read()` retorna o mesmo conteúdo salvo

---

### Passo 7 — LLM Caller

**O que fazer:**
Criar `llm-caller.ts` que:
- Recebe um prompt (string)
- Chama a API do modelo escolhido (escolhe **um** agora — ex: Anthropic)
- Retorna a resposta como string

**Critério de done:**
`llmCaller.call("Explique o que é uma API REST em 3 linhas")` retorna uma resposta coerente.

> ⚠️ **Decisão importante antes desse passo:** qual modelo vai usar no MVP?
> Escolhe um e hardcoda. A abstração `CostProvider` / multi-model vem depois.

---

### Passo 8 — Engine (o orquestrador)

**O que fazer:**
Criar `engine.ts` — a peça central que conecta tudo:

```
Para cada step do workflow:
  1. Verifica se o artefato já existe → se sim, loga "skipped" e pula
  2. Carrega a skill (.md)
  3. Injeta as variáveis no prompt (template engine)
  4. Chama o LLM
  5. Salva o artefato
  6. Loga "done: plan.md saved"
```

**Critério de done:**
Rodando `engine.run(workflow)` em um workflow de 3 steps, os 3 artefatos são gerados na ordem certa, e na segunda execução os 3 são pulados (idempotência).

---

### Passo 9 — CLI Entry Point

**O que fazer:**
Criar `cli/index.ts` usando `commander`:

```
aiwf run <story-id>     → localiza o workflow.yaml e executa o engine
aiwf run --dry-run      → mostra o que executaria sem chamar o LLM (útil para debug)
```

**Critério de done:**
`aiwf run STORY-001` executa a esteira completa e imprime no terminal o que fez em cada step.

---

### Passo 10 — Exemplo funcional + README

**O que fazer:**
- Criar `examples/STORY-001/workflow.yaml` com os 3 steps reais usando as skills existentes
- Escrever o `README.md` com:
  - Como instalar
  - Como criar um `workflow.yaml`
  - Como rodar `aiwf run`
  - Onde os artefatos são salvos

**Critério de done:**
Alguém que clonar o repositório consegue rodar `aiwf run STORY-001` seguindo só o README.

---

## Ordem de implementação recomendada

```
Passo 1  → Setup TypeScript + commander
Passo 2  → Tipos (Workflow, Step)
Passo 3  → Workflow Reader
Passo 4  → Skill Loader
Passo 5  → Template Engine
Passo 6  → Artifact Manager
Passo 7  → LLM Caller
Passo 8  → Engine (conecta tudo)
Passo 9  → CLI Entry Point
Passo 10 → Exemplo + README
```

> **Regra:** não pule para o passo N+1 sem o critério de done do passo N estar verde.
> Cada passo é um commit. Cada commit é verificável.

---

## Dependências npm que você vai usar

| Biblioteca | Para que serve |
|---|---|
| `commander` | Parsear comandos da CLI (`aiwf run`, flags) |
| `js-yaml` | Ler e parsear o `workflow.yaml` |
| `@anthropic-ai/sdk` | Chamar Claude (ou `openai` se preferir GPT) |
| `chalk` | Colorir o output do terminal (opcional, mas melhora UX) |
| `typescript` | Compilação |
| `tsx` | Rodar TypeScript direto sem compilar (ótimo para desenvolvimento) |
| `vitest` | Testes unitários (ecossistema moderno, similar ao JUnit) |

---

## Uma decisão que você precisa tomar antes do Passo 7

> **Qual LLM vai usar no MVP?**

Opções:
- **Anthropic (Claude)** — melhor para raciocínio e código, API bem documentada
- **OpenAI (GPT-4o)** — mais popular, documentação enorme
- **Google Gemini** — se preferir manter consistência com o Gemini CLI

**Recomendação:** escolhe o que você já tem chave de API. O motor não muda — só o SDK.

---

*Documento criado em 2026-07-08. Plano para Feature #1 do AI Workflow Engine.*
