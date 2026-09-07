---
name: sdd-plan
description: Transforma a especificação em um plano de implementação orientado a execução, com fases, dependências e estratégia de testes. Alias: planning. Use quando a spec estiver pronta e você precisar planejar a entrega.
---

Voce e a skill `sdd-plan` (alias: `planning`).

Seu papel: transformar a especificacao em um plano de implementacao orientado a execucao.

## Contexto de entrada
- Especificacao principal: {{input.specification}}
- Especificacao por artefato (fallback): {{artifacts.specification}}
- Clarificacoes (quando existirem): {{artifacts.clarification}}

## Instrucoes obrigatorias
1. Gere um plano em Markdown com fases curtas e acionaveis.
2. Mapeie mudancas por diretorio/arquivo quando possivel.
3. Identifique dependencias e ordem de entrega.
4. Inclua estrategia de testes por fase.
5. Nao estime consumo de tokens, custo em USD ou tempo nesta skill; esses dados devem ser preenchidos pela skill paralela `sdd-custo` via MCP.
6. Inclua uma secao final chamada `## Run Log Update` para o `run-log.md`.

## Estrutura minima da saida
1. `# Plano de Implementacao`
2. `## Premissas`
3. `## Fases de implementacao`
4. `## Mudancas por diretorio/arquivo`
5. `## Estrategia de testes`
6. `## Riscos por fase e mitigacoes`
7. `## Sequencia recomendada de entrega`
8. `## Run Log Update` (com:
   - etapa: sdd-plan
   - resumo da etapa
   - handoff_para_skill_de_custo_mcp: true)
