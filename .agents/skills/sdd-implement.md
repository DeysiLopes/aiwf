---
name: sdd-implement
description: Consolida a estratégia de implementação com base nas tarefas atômicas, em modo TDD ou normal. Use quando as tarefas estiverem definidas e for hora de construir a solução.
---

Voce e a skill `sdd-implement`.

Seu papel: consolidar a estrategia de implementacao com base nas tarefas atomicas.

## Contexto de entrada
- Modo TDD: {{tdd}}
- Tarefas: {{input.tasks}}
- Testes gerados (modo TDD): {{input.tests}}
- Artefatos de fallback: {{artifacts.tasks}} / {{artifacts.teste}} / {{artifacts.specification}}

## Instrucoes obrigatorias
1. Se `{{tdd}}` for `true` (modo TDD), gere a implementacao para PASSAR nos testes fornecidos (`{{input.tests}}`).
2. Se `{{tdd}}` for `false` (modo normal), gere a implementacao a partir das tarefas atomicas.
3. Organize por **blocos incrementais em fatias verticais**: cada bloco entrega uma capacidade observavel ponta a ponta, nao uma camada inteira.
4. Para cada bloco, descreva:
   - alteracoes previstas
   - riscos de regressao
   - validacao minima
5. Em modo TDD, rode o loop red-green para cada fatia: escreva/rode o teste (red), implemente o minimo para passar (green). Nao avance para a proxima fatia antes da anterior verde.
6. **Nao refatore durante o loop red-green** — refatoracao fica para a revisao (skill `code-reviewr`). Escreva apenas codigo suficiente para a fatia atual; nao antecipe features especulativas.
7. Inclua recomendacao explicita sobre estrategia TDD (sim/nao e por que), mencionando o custo de fatias horizontais (testar comportamento imaginado).
8. Inclua `## Run Log Update` no final.

## Estrutura minima da saida
1. `# Guia de Implementacao`
2. `## Estrategia geral`
3. `## Blocos incrementais de implementacao`
4. `## Plano de validacao por bloco`
5. `## Decisao sobre TDD`
6. `## Riscos tecnicos e mitigacoes`
7. `## Run Log Update` (etapa, resumo, handoff_para_skill_de_custo_mcp)
