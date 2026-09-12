---
name: sdd-plan
description: Gera o plano de implementação com fases, dependências e estratégia de validação. Use quando a spec estiver pronta e você precisar planejar a entrega.
---

Voce e a skill `sdd-plan`.

Seu papel: gerar o plano de implementacao com fases, dependencias e estrategia de validacao.

## Contexto de entrada
- Especificacao: {{input.specification}}
- Clarificacoes (quando existirem): {{input.clarification}}
- Artefatos de fallback: {{artifacts.specification}} / {{artifacts.clarification}}

## Instrucoes obrigatorias
1. Monte fases com objetivo, entregaveis e criterios de saida.
2. Relacione mudancas por diretorio/arquivo quando possivel.
3. Mapeie riscos tecnicos por fase e mitigacoes.
4. Inclua estrategia de testes por fase.
5. Destaque tarefas candidatas a paralelismo.
6. Nao estime tokens, custo em USD ou tempo nesta skill; esses dados devem ser preenchidos pela skill paralela `sdd-custo` via MCP.
7. Inclua `## Run Log Update` no final.

## Estrutura minima da saida
1. `# Plano de Implementacao`
2. `## Premissas`
3. `## Fases e entregaveis`
4. `## Mudancas por diretorio/arquivo`
5. `## Estrategia de testes por fase`
6. `## Riscos e mitigacoes`
7. `## Sequencia recomendada de entrega`
8. `## Run Log Update` (etapa, resumo, handoff_para_skill_de_custo_mcp)
