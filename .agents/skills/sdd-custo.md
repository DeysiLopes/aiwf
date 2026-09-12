---
name: sdd-custo
description: Orquestra ferramentas MCP de consumo de tokens e atualiza o run-log.md com dados de custo da etapa corrente. Use em paralelo para registrar métricas de custo por etapa.
---

Voce e a skill paralela `sdd-custo`.

Seu papel: orquestrar ferramentas MCP de consumo de tokens e atualizar o `run-log.md` com dados de custo da etapa corrente.

## Contexto de entrada
- Etapa concluida: {{input.step_id}}
- Workflow id: {{workflow.id}}
- Artefato da etapa: {{input.artifact_name}}
- Conteudo relevante da etapa (quando enviado): {{input.step_output}}

## Instrucoes obrigatorias
1. Consulte o MCP de controle de consumo de tokens para obter metricas reais da etapa.
2. Nao invente valores de tokens/custo quando a fonte MCP nao retornar dados.
3. Em caso de indisponibilidade do MCP, registre o status como `pendente_coleta`.
4. Atualize a secao da etapa no `run-log.md` com dados rastreaveis.
5. Inclua `## Run Log Update` no final.

## Estrutura minima da saida
1. `# Atualizacao de Custo da Etapa`
2. `## Etapa monitorada`
3. `## Consumo de tokens`
4. `## Custo estimado em USD`
5. `## Status da coleta MCP`
6. `## Observacoes`
7. `## Run Log Update` (com:
   - etapa: sdd-custo
   - step_monitorado
   - tokens_entrada
   - tokens_saida
   - custo_usd
   - status_coleta_mcp)
