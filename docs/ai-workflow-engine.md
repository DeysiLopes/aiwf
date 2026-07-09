Eu acho que essa é uma ideia que vale a pena amadurecer antes de escrever código. O maior risco não é a implementação, e sim definir uma arquitetura que continue boa daqui a 3 ou 5 anos.

## Minha proposta de arquitetura

Eu faria em camadas.

```
                   AI Workflow Engine
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
 Context Manager    FinOps Manager    Artifact Manager
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    Skill Engine
                          │
              Plugin / Skill Registry
                          │
      ┌──────────────┬──────────────┬──────────────┐
      │              │              │
 Prompt Builder   Planning      Testing
      │              │              │
      └──────────────┼──────────────┘
                     │
                 MCP Registry
                     │
      Git • GitHub • Chrome • Sonar • AWS • ...
```

Perceba que a **CLI nem aparece**. Isso é proposital.

------

# A CLI

A CLI é só uma interface.

Ela deveria ser algo extremamente simples.

```
aiwf run STORY-123

aiwf plan

aiwf review

aiwf finops
```

Ela recebe o comando e chama o Core.

------

# O Core

É o AI Workflow Engine.

Ele sabe:

- em qual etapa está;
- qual artefato existe;
- quais skills precisam ser executadas;
- quais plugins existem;
- qual MCP chamar;
- quanto pode gastar.

Toda a inteligência mora aqui.

------

# Skill Engine

Eu faria um motor de skills.

Cada skill teria algo parecido com:

```
name: planning

requires:
  - specification

produces:
  - plan.md

optional:
  - ddd
  - hexagonal

llm:
  preferred_model: normal
```

Assim o Workflow Engine nem precisa conhecer a Planning.

Ele apenas pergunta:

> Quem produz Plan.md?

O Skill Engine responde.

------

# Plugin Registry

Esse eu acho que seria um dos pontos mais legais.

Imagina uma pasta:

```
plugins/

spring/

java/

python/

rust/

aws/

terraform/

kafka/

ddd/

hexagonal/
```

Cada plugin registra:

- skills
- prompts
- templates
- comandos
- MCPs necessários

Então instalar um plugin seria algo como:

```
aiwf plugin install spring
```

------

# MCP Registry

Parecido.

```
mcps/

git/

github/

jira/

chrome/

postgres/

docker/

aws/
```

Cada MCP informa:

- nome
- comandos
- autenticação
- tools disponíveis

------

# Context Manager

Esse componente acho que vai ser um dos mais importantes.

Ele decide:

- quais arquivos entram no prompt;
- quais saem;
- quais são resumidos;
- quais já estão em cache.

Isso economiza muitos tokens.

------

# Artifact Manager

Você já começou isso.

Ele controla:

- specification.md
- plan.md
- tasks.md
- review.md
- test-report.md

Todos são artefatos.

------

# FinOps Manager

Na minha opinião ele merece um módulo separado.

Ele controla:

- orçamento mensal;
- sprint;
- história;
- consumo;
- baseline;
- previsão;
- cache;
- troca de modelo.

------

# Scheduler

Outra coisa que colocaria.

Imagine:

```
Story criada

↓

Workflow Engine

↓

Planning

↓

Aguardando usuário responder Clarification

↓

Retoma automaticamente
```

Ou seja, ele sabe pausar e continuar.

------

# Event Bus

Eu faria tudo orientado a eventos.

Por exemplo:

```
Specification criada

↓

evento

↓

Planning escuta

↓

Planning inicia
```

Amanhã você cria uma nova skill.

Ela apenas escuta o evento.

Não precisa alterar o Workflow Engine.

------

# Arquiteturas que eu pesquisaria

Essas são arquiteturas que conversam muito com a sua ideia:

- **Hexagonal Architecture** (para o Core do projeto).
- **Plugin Architecture** (VS Code, IntelliJ, Gradle são ótimos exemplos).
- **Pipeline Pattern** (cada etapa transforma um artefato).
- **State Machine** (cada etapa da esteira é um estado).
- **Event-Driven Architecture (EDA)** (as etapas reagem a eventos em vez de chamadas diretas).
- **Ports and Adapters** (para integrar MCPs sem acoplamento).
- **Chain of Responsibility** (skills que podem delegar para outras).
- **Strategy Pattern** (escolha de modelo: Normal, Concise, Econômico).
- **Registry Pattern** (descoberta dinâmica de skills, plugins e MCPs).

------

# Tecnologias que eu pesquisaria

Se você for fazer em Java (que combina com sua experiência):

- **Picocli** (CLI).
- **PF4J** (Plugin Framework for Java) — excelente para plugins.
- **Spring Boot** (se quiser expor uma API futuramente).
- **Jackson** (artefatos em JSON/YAML).
- **SnakeYAML** (configuração declarativa).
- **ArchUnit** (garantir a arquitetura do projeto).

------

## O que eu faria diferente do mercado

Se eu fosse desenhar essa ferramenta, o foco não seria "uma CLI para conversar com IA".

Seria algo como:

> **AI Workflow Engine**: um motor de execução para fluxos de desenvolvimento orientados por IA.

A CLI seria apenas um cliente desse motor.

No futuro, o mesmo Engine poderia ser usado por:

- uma extensão para VS Code;
- um plugin para IntelliJ;
- uma API REST;
- um GitHub Action;
- um servidor MCP.

Sem mudar a lógica do Core.

## Minha última sugestão

Há um conceito que eu adicionaria ao seu desenho: **Workflow as Code**.

Em vez de a esteira ser fixa no código, ela poderia ser descrita em YAML, por exemplo:

```
workflow:
  - prompt-builder
  - specification
  - clarification
  - planning
  - tasks
  - implementation
  - tests
  - review
  - close
```

Assim, qualquer pessoa poderia criar um novo fluxo sem recompilar a ferramenta. Para uma plataforma open source, isso seria um diferencial enorme, porque tornaria o AI Workflow Engine extensível não só por plugins, mas também por definição declarativa de workflows. Eu considero essa uma das ideias mais promissoras para o projeto.



Ai, será que uma CLI feita em Java não ficaria muito pesada? Talvez uma em Node fique mais leve, não?



Essa é uma ótima dúvida, e eu acho que vale a pena pensar nela antes de começar.

Minha resposta curta seria:

- **Se o objetivo é adoção pela comunidade**, eu faria em **Node.js/TypeScript**.
- **Se o objetivo fosse uma ferramenta corporativa interna**, Java seria uma excelente escolha.

### Por que Node/TypeScript?

Hoje praticamente todo mundo que usa ferramentas de IA já tem Node instalado por causa de ferramentas como:

- Claude Code
- Gemini CLI
- Aider (Python)
- MCP Servers (muitos são em Node)
- VS Code (ecossistema JavaScript/TypeScript)

A instalação fica simples:

```
npm install -g aiwf
```

ou

```
npx aiwf run
```

Além disso, o ecossistema de IA hoje está muito forte em TypeScript.

------

### E Java?

Java não é pesado por ser Java. O problema é a distribuição.

Normalmente o usuário teria que ter uma JDK instalada, ou você teria que empacotar um runtime junto.

Por outro lado, Java tem vantagens enormes:

- arquitetura mais robusta;
- tipagem excelente;
- ótimo suporte a plugins;
- fácil testar;
- ótimo para projetos grandes.

------

### O que eu faria no seu lugar

Como você já programa em Java **e** trabalha bastante com TypeScript/Node por causa dos MCPs, eu faria assim:

### Core em TypeScript

Porque:

- conversa naturalmente com MCP;
- conversa naturalmente com Node;
- conversa naturalmente com VS Code;
- conversa naturalmente com o ecossistema de IA.

------

### Depois, se o projeto crescer

Você pode até separar:

```
@aiwf/core

@aiwf/cli

@aiwf/plugin-java

@aiwf/plugin-spring

@aiwf/plugin-aws

@aiwf/plugin-github
```

Isso é muito comum no ecossistema npm.

------

### Tem outro motivo que me faz preferir TypeScript

Pela nossa conversa inteira, percebi que você quer que a ferramenta:

- descubra plugins;
- carregue MCPs;
- leia YAML;
- faça scraping;
- converse com agentes;
- rode no terminal;
- talvez tenha extensão do VS Code.

Tudo isso já é muito natural em Node.

------

## Uma ideia que eu gostei muito

Enquanto você estava descrevendo, eu pensei em algo que pode deixar a ferramenta ainda mais interessante.

Hoje existem:

- MCP (Model Context Protocol)
- A2A (Agent-to-Agent)
- Skills
- Tools

O **AI Workflow Engine** poderia ser um nível acima disso.

Em vez de apenas executar ferramentas, ele executaria **workflows inteligentes**.

Ou seja:

```
LLM

↓

Workflow Engine

↓

Skills

↓

MCPs

↓

Ferramentas
```

Na minha opinião, esse é o diferencial.

Você não estaria competindo com Claude Code ou Gemini CLI.

Você estaria criando algo que **eles poderiam usar**.

Ou seja, o AI Workflow Engine seria um **motor de workflows para agentes**, enquanto Claude Code, Gemini CLI e outras ferramentas seriam apenas os "cérebros" (LLMs) conectados a ele.

Esse posicionamento me parece muito mais interessante para um projeto open source e, sinceramente, é uma ideia que eu ainda não vejo consolidada como uma ferramenta única e bem integrada no ecossistema. Isso pode dar uma identidade bem própria ao projeto.



Sim, mas depende da ferramenta. Existe uma diferença importante entre **a API do modelo** e **a API da plataforma/CLI**.

### 1. OpenAI (GPT/Codex)

Se você usa a API da OpenAI diretamente, existe uma forma de consultar informações de uso e faturamento da sua organização. Ou seja, você consegue construir um painel de consumo usando as APIs da plataforma.

Se você usa apenas uma ferramenta que consome essa API (por exemplo, uma CLI de terceiros), ela pode ou não expor essas informações.

------

### 2. Claude Code

É um caso diferente.

O Claude Code pode funcionar usando:

- sua própria chave da API da Anthropic; ou
- um plano como Max/Pro.

Se você usa a API da Anthropic, você consegue medir o consumo pela própria plataforma da Anthropic.

Mas o **Claude Code em si não foi pensado como uma API de métricas** para outras aplicações.

------

### 3. Gemini CLI

O mesmo raciocínio.

Se estiver usando a API do Gemini, há métricas de uso na plataforma do Google Cloud/AI Studio, dependendo de como a autenticação foi configurada.

A CLI é apenas um cliente.

------

### 4. Devin

O Devin é diferente porque é uma plataforma fechada.

Ela possui métricas de uso para o próprio produto, mas a disponibilidade de APIs públicas para consumo dessas métricas depende do que a empresa disponibiliza. Não é algo universal como a API de um LLM.

------

## No seu ambiente corporativo

O que você descreveu parece ser outra arquitetura.

Provavelmente existe algo assim:

```
Claude Code
Gemini CLI
Devin CLI
Codex

        │

        ▼

Hub Corporativo

        │

        ▼

Dashboard de Custos
```

Esse **Hub** provavelmente intercepta ou centraliza as chamadas e mantém um banco de dados de consumo por usuário, projeto ou sessão.

Ou seja, pode ser que você **não esteja consultando a Anthropic, OpenAI ou Google diretamente**.

Você pode estar consultando um serviço interno da empresa que agrega essas informações.

------

## Isso conversa com o seu FinOps

Na verdade, eu faria o FinOps preparado para várias fontes.

Algo como uma interface:

```
Cost Provider

├── OpenAI
├── Anthropic
├── Gemini
├── Devin
├── GitHub Copilot
└── Corporate Hub
```

Cada um implementaria a mesma interface:

```
getBudget()

getCurrentUsage()

getSessionUsage()

getMonthlyUsage()
```

Assim, o Workflow Engine não precisa saber de onde vêm os dados.

------

## Se a API não existir

Você ainda teria uma alternativa:

O próprio AI Workflow Engine pode manter uma contabilidade local.

Por exemplo:

- cada chamada ao modelo registra:
  - modelo usado;
  - tokens de entrada;
  - tokens de saída;
  - custo estimado;
  - workflow;
  - história;
  - sprint;
  - timestamp.

Com isso, você constrói seu próprio banco de métricas, independentemente da plataforma.

Na verdade, eu faria isso **mesmo quando existirem APIs oficiais**. Assim, o FinOps consegue medir exatamente o que interessa para o seu workflow (custo por história, por sprint, por etapa da esteira etc.), enquanto as APIs dos provedores servem para conciliação e validação dos números. Isso deixa a solução mais portátil e evita depender de uma plataforma específica.



Não, então, não, assim, como eles têm um contrato de corporação com todas essas ferramentas, então eles devem ter acesso a essas APIs, né? Então, tipo assim, se eu tenho um, se eu fiz essa endine, e aí a pessoa usa Cloud Code, e aí ela quer usar o Finops, como que ela vai, como que o Finops vai pegar essas informações? Ela vai pegar da conta da pessoa, né? Porque eu sei que o Cloud Code tem aquele barra cost, e aí ele dá o custo da sessão, né? Ela tem os status, né, da sessão. Só que eu não consegui fazer no NCP rodar esse comando para pegar essas informações de output, porque é como se criasse uma nova, é uma janela em cima de uma janela, e aí ele não consegue pegar essa informação, só quem tá, o usuário que consegue ver, entendeu? Então, esse é o meu ponto, tipo, eles devem ter essa informação porque eles têm um contrato corporativo, e a pessoa que utilizar só teria uma assinatura e tal, então ela de certa forma vai ter essa informação.





Agora entendi exatamente o ponto. E a resposta é: **sim, é bem provável que uma empresa com contrato corporativo tenha acesso a informações que um usuário comum não tem**, mas isso depende do fornecedor.

Você está pensando no seguinte cenário:

> "Se eu publicar o AI Workflow Engine, como o FinOps vai descobrir quanto o Claude Code (ou Gemini CLI, ou GitHub Copilot etc.) gastou?"

Esse é o problema central.

## Existem algumas possibilidades

### 1. API oficial de uso (o ideal)

Alguns provedores oferecem APIs ou dashboards administrativos com métricas de uso para organizações.

Se existirem endpoints para:

- consumo por usuário;
- consumo por sessão;
- consumo por projeto;

o FinOps pode consumir esses dados diretamente.

Essa seria a melhor integração.

------

### 2. CLI expõe comandos

Por exemplo, você citou:

```
/cost
```

Se a própria CLI tivesse um comando "não interativo" como:

```
claude cost --json
```

seria perfeito.

Mas, pelo que você descreveu, hoje isso não acontece: `/cost` é um comando **interativo**, exibido dentro da sessão da CLI, e não algo fácil de capturar por outra ferramenta.

------

### 3. Logs locais

Algumas CLIs salvam histórico, logs ou métricas em arquivos locais.

Se isso existir, o FinOps poderia ler esses arquivos periodicamente.

------

### 4. Estimativa própria

Se nenhuma das opções acima estiver disponível, o AI Workflow Engine pode manter sua própria contabilidade.

Sempre que ele chamar um modelo, registra:

- modelo;
- tokens de entrada;
- tokens de saída;
- custo estimado.

Isso funciona muito bem quando o próprio Workflow Engine controla as chamadas.

------

## No seu caso específico

Como você falou do **Claude Code**, eu faria uma abstração.

O FinOps não conhece Claude.

Ele conhece um **Cost Provider**.

Por exemplo:

```
interface CostProvider {

    getCurrentSession()

    getMonthlyUsage()

    getBudget()

}
```

Depois você implementa:

- Claude Cost Provider
- OpenAI Cost Provider
- Gemini Cost Provider
- GitHub Copilot Cost Provider
- Devin Cost Provider

Cada um descobre as informações da melhor maneira possível.

------

## O que eu faria como projeto open source

Eu não acoplaria o FinOps a nenhuma ferramenta específica.

Em vez disso, criaria um sistema de provedores.

Algo como:

```
provider: claude
```

ou

```
provider: openai
```

ou

```
provider: github-copilot
```

Assim, quando um provedor passar a oferecer uma API oficial de métricas, basta implementar um novo adaptador, sem mudar o restante do Workflow Engine.

------

## Um ponto importante

Há um detalhe técnico que pode mudar a estratégia: muitas ferramentas como Claude Code, Gemini CLI e GitHub Copilot **não expõem necessariamente todos os dados de custo por uma API pública**, mesmo que mostrem essas informações na interface. Em contratos corporativos, é comum existirem **painéis administrativos ou integrações privadas** que não estão disponíveis para usuários individuais ou projetos open source.

Por isso, eu projetaria o FinOps para funcionar em três níveis:

1. **Usar uma API oficial**, quando existir.
2. **Usar um plugin/adaptador** para integrar com uma plataforma corporativa (como um hub interno da empresa).
3. **Fazer estimativas locais** quando nenhuma das duas opções anteriores estiver disponível.

Essa arquitetura evita que o seu projeto fique dependente de um único fornecedor e permite que a comunidade contribua com novos adaptadores conforme surgirem APIs ou integrações oficiais.



Beleza, você já tirou todas as minhas dúvidas. Gostei desse papo. Muito obrigada.



Fico muito feliz que tenha gostado da conversa! 😊

E, sinceramente, foi uma discussão bem interessante porque começou com uma dúvida simples de **"MCP gasta token?"** e foi evoluindo para um desenho de arquitetura bem mais amplo.

O que eu achei mais forte na ideia que você trouxe foi a separação de responsabilidades:

- **AI Workflow Engine** → o motor que coordena o ciclo de vida.
- **CLI** → apenas a interface para o desenvolvedor interagir.
- **Skills** → especialistas reutilizáveis.
- **MCPs** → adaptadores para ferramentas externas.
- **Context Manager** → controle de contexto e economia de tokens.
- **FinOps Manager** → governança de custo e otimização.
- **Plugin Registry** → extensibilidade para a comunidade.

E tem um ponto que eu acho que vale você guardar para quando for tirar isso do papel: não comece pela CLI. Comece pelo **core do Workflow Engine**.

Uma primeira versão poderia ser extremamente simples:

```
ai-workflow-engine/
├── core/
│   ├── workflow
│   ├── skill-engine
│   ├── artifact-manager
│   └── context-manager
│
├── cli/
│   └── comandos
│
├── plugins/
│
└── examples/
```

E o primeiro workflow nem precisaria chamar LLM de verdade. Poderia ser algo como:

```
workflow:
  - specification
  - planning
  - tasks
```

Só para validar o motor.

Depois você adicionaria:

- MCP;
- skills;
- FinOps;
- plugins;
- integração com modelos.

Acho que a parte mais legal é que você já está pensando com uma visão de **produto open source**, não apenas "vou automatizar meu trabalho". A preocupação com separar propriedade intelectual da empresa, criar plugins genéricos e não acoplar em uma ferramenta específica é exatamente o tipo de pensamento que evita um projeto morrer depois de um protótipo.

Quando você for começar, eu pesquisaria principalmente:

- **Plugin Architecture**
- **Workflow Engine Design**
- **State Machine**
- **Event-Driven Architecture**
- **Hexagonal Architecture**
- **Agent Orchestration**
- **MCP Server Architecture**
- **LLM Context Management**
- **AI Agent Observability / LLMOps / FinOps**

E eu manteria esse nome em mente: **AI Workflow Engine**. Ele descreve melhor o que você está criando do que "CLI de IA", porque a CLI é só a porta de entrada. O valor está no motor por trás.

Foi um papo bem legal mesmo. 🙂

O menu 1Password está disponível. Pressione a seta para baixo para selecionar.