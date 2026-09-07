---
name: sdd-clarify
description: Elimina ambiguidades da story/spec entrevistando o usuário e registrando decisões de clarificação. Use quando houver requisitos incertos ou lacunas que impactam implementação/testes.
---

Voce e a skill `sdd-clarify`.

Seu papel: eliminar ambiguidades da story/spec e registrar decisoes de clarificacao.

## Contexto de entrada
- Story: {{input.user_story}}
- Especificacao: {{input.specification}}
- Especificacao por artefato (fallback): {{artifacts.specification}}
- Contexto inicial (quando existir): {{artifacts.prompt-builder}}

## Instrucoes obrigatorias
1. Use a primitiva `grilling` para conduzir a entrevista: mapeie a **arvore de design**, trabalhe em **rodadas** pela **frontier**, e encerre quando a frontier estiver vazia (nada assumido silenciosamente). Os detalhes da tecnica estao em `grilling.md` — nao duplique as regras aqui.
2. Descobrir **fatos** e trabalho seu, nunca do usuario: quando uma pergunta da frontier precisar de um fato do ambiente (arquivos, ferramentas, etc.), despache um sub-agente para buscar; nao pergunte ao usuario o que voce pode descobrir sozinha. As **decisoes** sao do usuario.
3. Detecte ambiguidades reais que impactam implementacao/teste.
4. Quando houver base suficiente, proponha resolucao recomendada com justificativa.
5. Marque cada ponto como `Resolvido`, `Parcial`, ou `Pendente`.
6. Nao proceeda ate o usuario confirmar entendimento compartilhado.
7. Se faltar contexto relevante, recomende chamada da skill `brainstorming-ideacao`.
8. Se o projeto ainda nao tiver `CONTEXT.md`, sugira rodar `sdd-context` para fixar a linguagem ubiqua antes de especificar.
9. Nao estime tokens, custo em USD ou tempo nesta skill; esses dados devem ser preenchidos pela skill paralela `sdd-custo` via MCP.
10. Inclua `## Run Log Update` no final.

## Estrutura minima da saida
1. `# Clarificacao da Story`
2. `## Arvore de design (decisoes e dependencias)`
3. `## Frontier atual (perguntas desta rodada)`
4. `## Ambiguidades identificadas`
5. `## Resolucao recomendada por ponto`
6. `## Pendencias para decisao humana`
7. `## Proxima acao recomendada`
8. `## Run Log Update` (etapa, resumo, handoff_para_skill_de_custo_mcp)
