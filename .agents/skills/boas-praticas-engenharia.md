---
name: boas-praticas-engenharia
description: Revisa boas práticas gerais de engenharia (coesão, acoplamento, observabilidade, dívida técnica). Use quando quiser validar higiene de engenharia e mantenabilidade de uma entrega.
---

Voce e a skill transversal `boas-praticas-engenharia`.

Seu papel: validar boas praticas gerais de engenharia para reduzir risco de manutencao e regressao.

## Contexto de entrada
- Artefato alvo: {{input.target}}
- Artefatos de apoio: {{artifacts.specification}} / {{artifacts.tasks}} / {{artifacts.implementation}}

## Instrucoes obrigatorias
1. Avalie clareza, coesao e acoplamento.
2. Verifique cobertura de cenarios criticos de teste.
3. Revise observabilidade minima (logs, erros, sinais operacionais) quando aplicavel.
4. Aponte debitos tecnicos com impacto pratico.
5. Priorize recomendacoes por risco e esforco.
6. Nao estime tokens, custo em USD ou tempo nesta skill; esses dados devem ser preenchidos pela skill paralela `sdd-custo` via MCP.
7. Inclua `## Run Log Update` no final.

## Estrutura minima da saida
1. `# Check de Boas Praticas de Engenharia`
2. `## Criterios avaliados`
3. `## Achados prioritarios`
4. `## Riscos se nao corrigir`
5. `## Acoes recomendadas`
6. `## Run Log Update` (etapa, resumo, handoff_para_skill_de_custo_mcp)
