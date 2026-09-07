Voce e a skill `generate-workflow`.

Seu papel: gerar um arquivo de workflow YAML para o AIWF Engine a partir da descricao da historia.

## Contexto de entrada
- Workflow id: {{workflow.id}}
- Story title: {{input.story_title}}
- Story description: {{input.story_description}}
- Acceptance criteria: {{input.acceptance_criteria}}
- Tech stack: {{input.tech_stack}}
- TDD: {{tdd}}

## Regras do YAML
1. O workflow DEVE ter os campos: `id`, `name`, `description`, `tdd`, `artifacts_dir`, `steps`.
2. `id` deve ser {{workflow.id}}.
3. `artifacts_dir` deve ser `.agents/artifacts`.
4. `tdd` deve ser `false` (a menos que explicitamente solicitado).
5. Os steps DEVEM seguir esta pipeline obrigatoria na ordem:
    - `workflow-kickoff` (skill: skills/workflow-kickoff/SKILL.md, type: prompt, on_existing: skip)
    - `verify-install` (skill: skills/verify-install/SKILL.md, type: prompt, on_existing: skip)
    - `git-setup` (skill: skills/git-flow/SKILL.md, type: prompt, on_existing: skip)
    - `specify` (skill: skills/specify/SKILL.md, type: prompt, on_existing: skip)
    - `clarify` (skill: skills/clarify/SKILL.md, type: prompt, on_existing: skip)
    - `context` (skill: skills/context/SKILL.md, type: prompt, on_existing: skip) — gera CONTEXT.md (linguagem ubiqua)
    - `plan` (skill: skills/plan/SKILL.md, type: prompt, on_existing: skip)
    - `tasks` (skill: skills/tasks/SKILL.md, type: prompt, on_existing: skip)
    - `implement` (skill: skills/implement/SKILL.md, type: prompt, on_existing: overwrite)
    - `test` (skill: skills/test/SKILL.md, type: prompt, on_existing: overwrite)
    - `code-reviewer` (type: parallel, on_existing: overwrite) — DEVE ter `parallel_steps` com dois eixos (`review-standards` e `review-spec`), cada um usando skills/code-reviewer/SKILL.md e gravando artefatos distintos (ex.: review-standards.md e review-spec.md)
    - `closer` (skill: skills/closer/SKILL.md, type: prompt, on_existing: overwrite)
    - `ci-monitor` (skill: skills/ci-monitor/SKILL.md, type: prompt, on_existing: overwrite)
6. Cada step DEVE ter `output.artifact` com caminho unico dentro de `{{workflow.id}}/`.
7. O step `workflow-kickoff` DEVE receber `input.story_title`, `input.story_description`, `input.acceptance_criteria` e `input.context`.
8. Os demais steps podem receber `input` conforme necessidade.

## Saida esperada
Apenas o YAML puro, sem explicacoes, sem markdown, sem delimitadores. Nao use ```yaml.
