# Cronograma das 6 entregas — Internalização

**Épico:** TS-208  
**Início da contagem:** 1º de setembro de 2026  
**Premissa:** o piloto local já cobre, em grande parte, as entregas 1 a 5. As datas dessas fatias são de **apresentação, ajuste fino e homologação com o time**. A entrega 6 é **construção nova** (login, permissões, produção).

Ordem deste cronograma: **1 → 2 → 3 → 4 → 5 → 6** (quem opera a lista no dia a dia). Se a gestão preferir “enxergar o fluxo primeiro”: inverter 2 com 3 na mesma janela.

---

## Visão rápida

| Entrega | Até | O que está pronto nessa data |
| --- | --- | --- |
| 1. Visão única | **5 set 2026** | Board central + listas por área; INT; central só leitura |
| 2. Abrir e editar | **12 set 2026** | Nova demanda no Comercial; painel com campos; salvar |
| 3. Máquina de status | **19 set 2026** | Arrastar só o permitido; concluir destrava a próxima área |
| 4. Ajustes e retrabalho | **26 set 2026** | Pedir ajustes para Comercial e/ou Arquitetura; flag Retrabalho? |
| 5. Comentários | **3 out 2026** | Fio de comentários no INT (autor ainda sem login) |
| 6. Go-live | **31 out 2026** | Login, permissões, hospedagem, campos que faltam do SharePoint |

```
Setembro 2026          Outubro 2026
1         12        19        26    3                    31
|-- E1 --|-- E2 --|-- E3 --|-- E4 --|-- E5 --|-------- E6 --------|
```

---

## Entrega 1 — Visão única  
**Até 5 de setembro de 2026** (sexta)

Apresentar para gestão/coordenação.

- Board central com colunas por área e Concluído  
- Kanban e lista em cada área  
- INT no card; clique abre o detalhe na área  
- Encadeamento visível: Comercial → Arquitetura → Internalização → Operações + Finanças  

**Não entra nessa data:** formulário completo como foco da demo, login, produção.

---

## Entrega 2 — Abrir e editar demanda  
**Até 12 de setembro de 2026**

Apresentar para quem preenche a lista hoje.

- Nova demanda só no Comercial; INT gerado na hora  
- Painel com cliente, tipo, Protheus, serviços, squad, SA/SEs, BUs, prioridade, pessoas, internalização, Retrabalho?  
- Regras na tela (Alta/Crítica; GP e líder em Operações + PrimeDeploy)  
- Card do board continua só com o resumo  

**Não entra nessa data:** Power Automate / transições como tema da reunião.

---

## Entrega 3 — Máquina de status  
**Até 19 de setembro de 2026**

Apresentar para gestão e quem depende do fluxo.

- Transições válidas no arrastar (ex.: Aguardando aprovação só de Em andamento)  
- Concluir uma área destrava a seguinte  
- Drop inválido não move o card  
- Demo de um INT do Comercial até Ops/Fin  

**Não entra nessa data:** pedido de ajustes (é a entrega 4).

---

## Entrega 4 — Ajustes e retrabalho  
**Até 26 de setembro de 2026**

Apresentar para Internalização, Operações e Comercial.

- Pedir ajustes com Comercial e/ou Arquitetura e justificativa  
- Destinos vão para Retrabalho; se os dois, só retoma quando os dois saírem  
- Flag vermelha só com o campo Retrabalho? marcado  

**Não entra nessa data:** comentários como foco; login.

---

## Entrega 5 — Comentários no INT  
**Até 3 de outubro de 2026**

- Formulário à esquerda, comentários à direita  
- Mesmo fio em todas as áreas  
- Deixar explícito: autor entra na entrega 6, com login  

---

## Entrega 6 — Go-live  
**Até 31 de outubro de 2026**

Janela de construção (não só demo):

| Marco | Até | Conteúdo |
| --- | --- | --- |
| 6a | 10 out | Login (identidade no comentário e no formulário) |
| 6b | 17 out | Permissões por área (quem vê / quem move) |
| 6c | 24 out | Campos que ainda faltam do SharePoint + hospedagem e backup |
| 6d | 31 out | Site oficial no ar; SharePoint/PA deixa de ser o caminho principal |

Campos típicos ainda fora do piloto: Contempla serviços Cisco, Tem PrimeDeploy/Adoption como campos próprios, justificativa da internalização, pasta SharePoint, e-mails equivalentes ao Power Automate (definir o que entra neste go-live).

---

## Como usar na apresentação

1. Mostrar a tabela “visão rápida” (uma tela).  
2. Dizer que **setembro = homologar o piloto em fatias**; **outubro = virar o sistema**.  
3. Pedir: quem valida cada data e se a ordem 1–6 permanece.

Datas podem ser puxadas ou empurradas na reunião; o recorte do que entra em cada entrega não deve misturar go-live (6) com as demos 1–5.
