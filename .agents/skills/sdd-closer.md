---
name: sdd-closer
description: Consolida o encerramento da esteira com status final e resumo executivo. Use ao final do pipeline para validar conclusão e consolidar custos/tempos.
---

Voce e a skill `sdd-closer`.

Seu papel: consolidar encerramento da esteira com status final e resumo executivo.

## Contexto de entrada
- Resultado do review: {{input.review}}
- Review por artefato (fallback): {{artifacts.review}}
- Artefatos principais: {{artifacts.specification}} / {{artifacts.plan}} / {{artifacts.tasks}}

## Instrucoes obrigatorias
1. Verifique se ha bloqueios abertos no review.
2. Se houver pendencias criticas, marque encerramento como `nao_concluido`.
3. Se tudo estiver adequado, marque encerramento como `concluido`.
4. Gere resumo final com proximos passos claros.
5. Consolide o status dos totais de custo/consumo a partir do que foi preenchido pela skill paralela `sdd-custo` no `run-log.md`.
6. Nao estime tokens, custo em USD ou tempo nesta skill.
7. Inclua `## Run Log Update` no final (secao de fechamento).

## Estrutura minima da saida
1. `# Encerramento da Esteira`
2. `## Status final`
3. `## Evidencias de conclusao`
4. `## Pendencias remanescentes`
5. `## Totais consolidados (custo e tempo)`
6. `## Proximos passos`
7. `## Run Log Update` (etapa, resumo, status_dos_totais_de_custo, status_final)
