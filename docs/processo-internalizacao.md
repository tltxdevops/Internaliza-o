# Processo de internalização

Documenta o fluxo que o site cobre no lugar das listas do SharePoint. Regras de negócio estão no código (`src/domain/`); este arquivo descreve o processo para o time.

Épico de referência: **TS-208**.

## O que é

Cada demanda recebe um **INT** sequencial (`INT0001`, `INT0002`…). O trabalho passa pelas áreas nesta ordem:

1. **Comercial**
2. **Arquitetura**
3. **Internalização**
4. **Operações** (PMO / SOC / Transição) e **Finanças** (Finanças / Supply) em paralelo

Na sidebar: **Operações** e **Finanças**. Dentro de cada hub: visão geral + frentes de trabalho. O board central agrega Ops e Finanças em uma coluna cada.

O **board central** é só leitura: mostra onde cada INT está. Ninguém muda status dali. Abertura e edição acontecem nas **listas por área**.

## Como usar o site

- Board central: `/`
- Lista da área: `/areas/comercial`, `/areas/arquitetura`, `/areas/internalizacao`, `/areas/operacoes`, `/areas/financas`
- Frentes de Ops: `/areas/operacoes?frente=pmo` (ou `soc` / `transicao`)
- Frentes de Finanças: `/areas/financas?frente=financas` (ou `supply`)
- Kanban (opcional): `?view=kanban` — padrão é lista
- Abrir um card: clique no INT → painel com formulário (esquerda) e comentários (direita)

Nova demanda só no **Comercial** (`Nova demanda` ou `/areas/comercial?nova=1`).

## Abertura

Inside sales preenche o formulário. O INT é gerado na hora e o card nasce em Comercial, **Não iniciado**.

Campos principais na abertura e na edição:


| Campo                        | Tipo                  | Observação                                        |
| ---------------------------- | --------------------- | ------------------------------------------------- |
| Cliente                      | texto                 | obrigatório; vira o título da demanda             |
| Tipo de demanda              | Regular / Pré-demanda | obrigatório                                       |
| Nome da oportunidade         | texto                 |                                                   |
| Código do Projeto - Protheus | texto                 |                                                   |
| Serviços contemplados        | múltipla              | ver catálogo abaixo                               |
| Squad comercial              | única                 |                                                   |
| SA/SEs Arquitetura           | múltipla              |                                                   |
| BUs Arquitetura              | múltipla              |                                                   |
| Prioridade                   | única                 | Alta e Crítica exigem justificativa               |
| Justificativa da prioridade  | texto                 | só se Alta ou Crítica                             |
| Responsável                  | e-mail                |                                                   |
| Account Manager              | e-mail                |                                                   |
| Internalização               | única                 | Internalizado / com pendência / Não internalizado |
| Retrabalho?                  | —                     | **não edita mais** — preenchido ao pedir ajustes  |
| Motivo de correção           | múltipla              | gerado pelos destinos (Comercial / Arquitetura)   |
| Descrição do ajuste          | texto                 | justificativa do pedido de Aguardando ajustes     |
| Gerente de Projetos          | e-mail                | só PMO + PrimeDeploy                              |
| Líder Técnico                | e-mail                | só PMO + PrimeDeploy                              |


O INT não edita depois de gerado.

## Encadeamento das áreas

- Concluir **Comercial** abre **Arquitetura** em Não iniciado.
- Concluir **Arquitetura** abre **Internalização**.
- Concluir **Internalização** abre **Finanças** + **Supply** e as frentes de Operações cujo serviço bater:
  - **PMO** se houver PrimeDeploy
  - **SOC** se houver SOC ou PrimeMSS
  - **Transição** (ex-SG / Serviços Gerenciados) se houver NOC, PrimeSD, PrimeMS, PrimeIAAS, PrimeHoras ou PrimeOutsourcing
- Um INT pode abrir várias frentes ao mesmo tempo (ex.: PrimeDeploy + NOC → PMO + Transição + Finanças + Supply).

Uma área só aparece no board dela quando já foi destravada. O board central coloca o card na coluna da área que ainda está aberta (não concluída). Se várias frentes estão abertas, a visão central usa o andamento **mais atrasado** onde couber.

## Status por área

Arrastar o card só vale para o **próximo status permitido**. Drop inválido não move e, hoje, não mostra aviso.

### Comercial e Arquitetura

Colunas: Não iniciado → Em andamento → Retrabalho → Concluído.

- Não iniciado só vai para Em andamento.
- Em andamento pode ir para Concluído ou Retrabalho.
- Retrabalho volta para Em andamento ou conclui.
- Não têm Aguardando aprovação nem Aguardando ajustes.



### Internalização

Colunas extra: Em pausa, Aguardando aprovação, Aguardando ajustes. A coluna de retrabalho desta área (e de Ops/Fin) se chama **Pós ajustes** — o status interno continua `retrabalho`.

De **Em andamento** pode ir para: pausa, aguardando aprovação, aguardando ajustes, concluído ou pós ajustes.

**Aguardando aprovação** só entra a partir de **Em andamento**. De Não iniciado não dá para soltar nessa coluna. Ao soltar, o site pede confirmação para enviar a aprovação aos gestores.

De Aguardando aprovação: Em andamento, Aguardando ajustes ou Concluído.

De **Aguardando ajustes**, a retomada automática vai para **Pós ajustes** (não Em andamento).

### PMO, SOC, Transição, Finanças e Supply

Como Internalização, **sem** Aguardando aprovação. Pedem ajustes para Comercial e/ou Arquitetura.

## Pedir ajustes

Só Internalização, Ops (PMO/SOC/Transição), Finanças e Supply pedem ajustes.

Ao soltar em **Aguardando ajustes**, o sistema pergunta **para quem** enviar: Comercial, Arquitetura ou **os dois**. É seleção múltipla. Justificativa é obrigatória.

Efeito:

- A **frente** que pediu (ex.: só PMO, ou só Supply) fica em Aguardando ajustes — as outras frentes do mesmo INT **seguem** normalmente.
- No board central, essa frente **sai** da coluna Operações/Finanças e o INT volta a aparecer em **Comercial** e/ou **Arquitetura** (Retrabalho). Cada frente é um card próprio (INT · PMO, INT · Supply…).
- Cada destino escolhido vai para a coluna **Retrabalho**.
- Se o pedido incluir **Comercial** (só Comercial ou os dois), depois que Comercial sair de Retrabalho a **Arquitetura valida** as informações (vai para Retrabalho) mesmo que não tenha sido escolhida no pedido.
- Se o pedido for **só Arquitetura**, só Arquitetura entra em Retrabalho.
- **Só a frente que pediu** retoma quando os destinos da *dela* saírem de Retrabalho (não espera as outras frentes). A retomada é na coluna **Pós ajustes**.

## Aguardando aprovação (Internalização)

Ao soltar o card em **Aguardando aprovação**, o site pede confirmação: envia aprovação do INT para os gestores (lista placeholder até os e-mails oficiais). O disparo usa o mesmo canal de notificação dos e-mails de status.

## Flag RETRABALHO no card

São coisas diferentes:

1. **Coluna Retrabalho / Pós ajustes** — status do kanban da área.
2. **Pedido de ajustes** — ao enviar para **Aguardando ajustes**, o sistema preenche motivo, descrição e quem pediu. Aparece na lista e no painel do card (só leitura). O checkbox “Retrabalho?” do formulário foi removido.
3. **Badge vermelha RETRABALHO** — enquanto houver pedido ativo (`retrabalhoMarcado`).

Uso esperado: Ops/Fin/Internalização pede ajustes → Comercial/Arquitetura vê o pedido na lista e no card → trata e tira de Retrabalho → a frente que pediu retoma em Pós ajustes.

## Comentários

No painel da demanda, à direita do formulário. O fio é o mesmo em todas as áreas. Cada mensagem guarda texto, data e de qual área foi escrita.

Ainda **não há login**: o autor fica vazio até isso existir.

## Catálogos (listas de seleção)

Valores oficiais no código: `src/domain/demand-fields.ts`.

**Serviços contemplados:** PrimeDeploy, NOC, SOC, PrimeSD, PrimeMS, PrimeMSS, PrimeIAAS, PrimeHoras, PrimeOutsourcing.

**BUs:** Data Center, Networking, Observabilidade, Segurança, Serviços, Smart Devices.

**SA/SEs:** nomes da lista de Arquitetura + Default.

Se **PrimeDeploy** estiver nos serviços e a pessoa estiver na lista **PMO**, o formulário pede GP e líder técnico (e-mail).

## E-mails na mudança de status

O formulário **não** guarda a lista de quem opera o NOC ou a BU. Isso fica em **Cadastros** (`/cadastros`): cada serviço e BU tem os e-mails relacionados (como as listas de lookup do SharePoint).

Quando o status muda, o site cruza:

1. E-mails da demanda (responsável, AM, GP, líder técnico)
2. Contatos dos serviços e BUs escolhidos naquela demanda

Sem `SMTP_HOST` no `.env`, o disparo só é registrado em Cadastros → Envios. Com SMTP, tenta enviar de verdade.

## Ainda fora deste processo (SharePoint)

Campos da lista antiga que ainda não estão no site, entre outros: Contempla serviços Cisco, Tem PrimeDeploy / Tem Adoption (como cam   pos próprios), justificativa da internalização, pasta SharePoint.

Login e identidade no comentário também estão pendentes.

## Subir o ambiente local

```bash
cd internalizacao
npm install
npx prisma db push
npm run dev
```

Abrir **[http://localhost:3000](http://localhost:3000)** (http, não https). Banco SQLite: `dev.db` (`DATABASE_URL` no `.env`).

Testes das regras de domínio: `npm test`.