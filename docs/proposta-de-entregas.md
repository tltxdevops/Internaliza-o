# Site de Internalização — proposta de entregas

**Para:** alinhamento com gestão  
**De:** Vitor (engenharia)  
**Assunto:** como fatiar a substituição do SharePoint + Power Automate por um site, e o que cada fatia prova  
**Processo (regras de negócio):** ver também `processo-internalizacao.md`  
**Épico:** TS-208

---

## 1. Contexto

Hoje o processo de internalização (demandas **INT**) roda em **listas SharePoint** e **fluxos Power Automate**: abertura, passagem entre áreas, retrabalho e visibilidade dependem de várias listas e de automações que o time não vê.

Foi pedido um **site** para o mesmo processo. O objetivo desta proposta não é “terminar o sistema de uma vez”, e sim definir **entregas apresentáveis**: cada uma mostra uma melhoria concreta em relação ao SharePoint/PA, cabe numa demo curta e pode ser validada com o time.

Pergunta para a reunião: **esta ordem e este recorte fazem sentido para o que precisamos vender internamente e para o go-live?**

---

## 2. O que o site já pretende ser (visão)

- Um **INT** por demanda (`INT0001`…).
- Ordem das áreas: **Comercial → Arquitetura → Internalização → Operações e Finanças** (estas duas em paralelo).
- **Board central só leitura** (gestão). Status e formulário nas **listas por área**.
- Regras de coluna, ajustes e campos **no próprio site**, não em fluxo opaco.

Isso já está parcialmente construído em piloto local. As entregas abaixo organizam **o que apresentar**, não necessariamente “do zero”.

---

## 3. Como cada entrega deve ser julgada

Para cada fatia, na demo:

1. Dor atual (SharePoint / Power Automate).
2. O que a entrega tira da frente.
3. Um INT de ponta a ponta (roteiro de 10–15 min).
4. O que **ainda não** está nessa fatia (para não misturar com go-live).

Critério de “pronta para stakeholder”: alguém do time consegue **repetir a demo sem o desenvolvedor**.

---

## 4. Entregas propostas

### Entrega 1 — Visão única (o “porquê” do site)

| | |
| --- | --- |
| **O que se vê** | Board central + kanban/lista por área; INT no card; clique no INT abre o detalhe. |
| **O que substitui** | “Cadê o card?” entre várias listas. |
| **Melhoria** | Um INT, uma visão de onde está cada demanda; gestão não altera status no central. |
| **Aceite** | Encadeamento visível Comercial → Arquitetura → Internalização → Ops + Fin. Central somente leitura. |

**Público da demo:** gestão e coordenação.

---

### Entrega 2 — Abrir e editar demanda

| | |
| --- | --- |
| **O que se vê** | Nova demanda só no Comercial; INT gerado na hora; painel com campos (cliente, tipo, Protheus, serviços, squad, SA/SEs, BUs, prioridade, pessoas, internalização, retrabalho). |
| **O que substitui** | Formulário / colunas da lista SharePoint. |
| **Melhoria** | Um formulário; regras na tela (ex.: Alta/Crítica com justificativa; GP e líder técnico só em Operações se houver PrimeDeploy). Card do board permanece enxuto; detalhe no painel. |
| **Aceite** | Criar, reabrir, salvar. Campos do card no kanban continuam só o resumo (INT, tipo, cliente, oportunidade, Protheus, prioridade). |

**Público da demo:** quem hoje preenche a lista.

---

### Entrega 3 — Máquina de status (o Power Automate “invisível”)

| | |
| --- | --- |
| **O que se vê** | Arrastar card só para o próximo status permitido (ex.: Aguardando aprovação só a partir de Em andamento). Concluir uma área destrava a seguinte. |
| **O que substitui** | Fluxos que mudam coluna / criam item na lista da próxima área. |
| **Melhoria** | A regra mora no site. Menos dependência de fluxo parado ou lista dessincronizada. |
| **Aceite** | Um INT do Comercial até Ops/Fin. Um drop inválido **não** move o card. |

**Público da demo:** gestão + quem “apanha” do PA hoje.

---

### Entrega 4 — Ajustes e retrabalho

| | |
| --- | --- |
| **O que se vê** | Internalização, Operações ou Finanças pedem ajustes; escolhem **Comercial e/ou Arquitetura**; justificativa obrigatória; destinos vão para Retrabalho. Se os dois foram escolhidos, quem pediu só retoma quando **os dois** saírem de Retrabalho. |
| **O que substitui** | Devolução e visibilidade de retrabalho no PA/listas. |
| **Melhoria** | Destino múltiplo explícito. **Flag vermelha RETRABALHO no card só se o campo “Retrabalho?” do formulário estiver marcado** — entrar na coluna Retrabalho/Pós ajustes sozinho não coloca a flag. |
| **Aceite** | Caso “só Comercial” e caso “os dois”. Flag alinhada ao campo, não à coluna. |

**Público da demo:** Internalização / Ops / Comercial.

---

### Entrega 5 — Comentários no INT

| | |
| --- | --- |
| **O que se vê** | Ao abrir o card na área: formulário à esquerda, comentários à direita. O fio é o mesmo em todas as áreas. |
| **O que substitui** | Comentário espalhado em lista, Teams ou e-mail do fluxo. |
| **Melhoria** | A conversa cola no INT. |
| **Limitação a deixar explícita** | Ainda **não há login**; o autor do comentário entra quando houver autenticação. |
| **Aceite** | Publicar um comentário numa área e vê-lo em outra. |

**Quando entrar na ordem:** depois da Entrega 4 estável, para não virar “mais um campo” no meio do fluxo.

---

### Entrega 6 — Acesso, operação e restante do SharePoint (go-live)

| | |
| --- | --- |
| **O que se vê** | Login, quem pode o quê por área, campos ainda não migrados, hospedagem, backup. |
| **O que substitui** | Permissão de lista SharePoint e alertas/e-mails do Power Automate (na medida em que forem no escopo). |
| **Melhoria** | O site vira o sistema oficial, não o piloto. |
| **Ainda fora do piloto atual (exemplos)** | Contempla serviços Cisco; Tem PrimeDeploy / Tem Adoption como campos próprios; justificativa da internalização; pasta SharePoint; identidade no comentário. |
| **Aceite** | Papéis (ex. Comercial vs Operações), auditoria mínima, ambiente que não é só `localhost`. |

---

## 5. Ordem sugerida (duas opções)

**Se o público principal for gestão** (“quero enxergar e o fluxo não pode quebrar”):

1 → **3** → **4** → **2** → 5 → 6

**Se o público principal for quem preenche lista o dia inteiro:**

1 → **2** → **3** → **4** → 5 → 6

A Entrega **6** é go-live. Não misturar na mesma reunião da Entrega 1.

---

## 6. Situação atual do piloto (transparência)

Já existe um piloto local (Next.js + SQLite) cobrindo, em grande parte, as Entregas **1 a 5**: boards, formulário, máquina de status, ajustes múltiplos, flag de retrabalho e comentários sem autor.

O que **não** deve ser vendido como pronto: login, permissões, produção, campos SharePoint ainda listados na Entrega 6, e notificações equivalentes a todos os e-mails do Power Automate.

Documentação das regras do processo: `docs/processo-internalizacao.md`.

---

## 7. O que se pede nesta reunião

1. Concordar (ou ajustar) o **recorte das seis entregas**.  
2. Escolher a **ordem** (gestão vs operação).  
3. Definir **quem valida** cada demo (nome + área).  
4. Deixar claro o que entra só na **Entrega 6**, para não inflar as demos 1–5.

---

## 8. Roteiro mínimo de demo (Entrega 1, se for a primeira reunião)

1. Abrir o board central: várias colunas de área, INT nos cards.  
2. Clicar num INT: cai na área com o painel.  
3. Mostrar que o central não edita status.  
4. Abrir Comercial e (se houver dado) avançar um card até destrave da próxima área.  
5. Fechar dizendo: “a próxima entrega prova o formulário / a próxima prova o PA”.

Ambiente de piloto: `http://localhost:3000` após `npm run dev` na pasta do projeto.

---

*Documento para discussão. Não substitui o Jira (TS-208) nem o detalhe operacional em `processo-internalizacao.md`.*
