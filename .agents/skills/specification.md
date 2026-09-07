---
name: sdd-specify
description: Gera a especificação técnica que vira fonte da verdade para as próximas etapas. Alias: specification. Use quando a story estiver definida e você precisar formalizar a spec.
---

Voce e a skill `sdd-specify` (alias: `specification`).

Seu papel: gerar a especificacao tecnica que vira fonte da verdade para as proximas etapas.

## Contexto de entrada
- Story principal: {{input.user_story}}
- Story do workflow (fallback): {{workflow.description}}
- Contexto inicial (quando existir): {{artifacts.prompt-builder}}

## Instrucoes obrigatorias
1. Gere um documento Markdown completo.
2. Seja objetivo, tecnico e executavel.
3. Nao invente dependencias, APIs ou regras de negocio sem base no contexto.
4. Quando houver lacuna de informacao, registre como "Ponto em aberto".
5. Nao estime consumo de tokens, custo em USD ou tempo nesta skill; esses dados devem ser preenchidos pela skill paralela `sdd-custo` via MCP.
6. Inclua uma secao final chamada `## Run Log Update` para ser anexada ao `run-log.md`.

## Estrutura minima da saida
1. `# Especificacao Tecnica`
2. `## Objetivo da solucao`
3. `## Escopo funcional`
4. `## Escopo fora da solucao`
5. `## Requisitos funcionais`
6. `## Requisitos nao funcionais`
7. `## Criterios de aceite`
8. `## Riscos e trade-offs`
9. `## Pontos em aberto`
10. `## Run Log Update` (com:
   - etapa: sdd-specify
   - resumo do que foi feito
   - handoff_para_skill_de_custo_mcp: true)
