# webapp-cupom-floripa

Webapp de resgate de cupom de desconto (40% off) para usuários inativos de Florianópolis com 1–3 viagens. Parte da ação de retenção Ops + MKT — Mai/Jun 2026.

**URL de produção:** https://lesquerdo-whoosh.github.io/webapp-cupom-floripa/  
**URL final (pendente DNS):** https://cupom-floripa.whoosh.bike

---

## Como funciona

1. Usuário recebe um link via WhatsApp/EDNA/email
2. Digita o número de telefone com DDD
3. O webapp valida contra a whitelist de ~204k usuários elegíveis
4. Se elegível: exibe o cupom único do usuário + botão para abrir o app Whoosh
5. Se já resgatou antes: exibe o cupom novamente (recuperação)
6. Se não elegível: mensagem clara com instrução de suporte

---

## Stack

| Componente | Solução |
|---|---|
| Frontend | HTML5 + CSS3 + Vanilla JS — sem frameworks |
| Hosting | GitHub Pages (branch `main`, raiz `/`) |
| Backend | Google Apps Script (webhook POST) |
| Dados | Google Sheets |

---

## Estrutura do repositório

```
webapp-cupom-floripa/
├── index.html        # Webapp completo — frontend + lógica JS
├── apps-script.js    # Código do webhook (Google Apps Script)
├── whoosh-logo.png   # Wordmark Whoosh (sobre fundo navy #0f172a)
├── CLAUDE.md         # Constituição técnica do projeto (design system, regras UX/QA)
└── README.md         # Este arquivo
```

---

## Google Sheets

**Planilha:** [webapp-cupom-floripa](https://docs.google.com/spreadsheets/d/1OheSy15dqFwuzkRDJMmd5EID8yDXIVMj1DtrX5otmJc/)

### Aba `Whitelist`
Importar via Arquivo → Importar (substituir aba atual). Formato:

| phone_normalized | segment | cupom |
|---|---|---|
| 5548999999999 | 1-viagem | ABC123XYZ |
| 5548988888888 | 2-3-viagens | DEF456UVW |

- `phone_normalized` — número com DDI 55 + DDD + número, só dígitos (ex: `5548999999999`)
- `segment` — `1-viagem` ou `2-3-viagens` (gravado em Resgates para analytics)
- `cupom` — código único por usuário, pré-gerado pela Whoosh Russia

### Aba `Resgates`
Criada automaticamente pelo Apps Script na primeira execução. Colunas:

| timestamp | telefone | segmento | cupom |
|---|---|---|---|
| 2026-05-26T15:00:00.000Z | (48) 99999-9999 | 1-viagem | ABC123XYZ |

---

## Apps Script (webhook)

**URL do webhook (v3):**  
`https://script.google.com/macros/s/AKfycbzJwiCyI8EIk4u--j7oo2qP1Ldxm8USyLbUaMEbQVgu2sbUwMfJO0xpeFDC_c494vIFnA/exec`

### Como atualizar o webhook

1. Abrir [Google Apps Script](https://script.google.com) → projeto `webapp-cupom-floripa`
2. Substituir o conteúdo do `Code.gs` pelo conteúdo de `apps-script.js`
3. **Implantar → Gerenciar implantações** → editar (lápis) → **Nova versão** → **Implantar**
4. A URL não muda entre versões

### Configurações de implantação

- **Executar como:** Me (Lucas Esquerdo)
- **Quem tem acesso:** Anyone
- **Método HTTP:** POST com `Content-Type: text/plain` (evita preflight CORS)

---

## Domínio customizado

Quando o DNS estiver configurado pelo time de infra, commitar o arquivo `CNAME` na raiz:

```
cupom-floripa.whoosh.bike
```

Registro DNS necessário:
```
Tipo:  CNAME
Nome:  cupom-floripa
Valor: lesquerdo-whoosh.github.io
```

> ⚠️ Só commitar o CNAME após confirmar que o DNS está no ar. Se o CNAME existir no repo sem o DNS, o GitHub Pages redireciona o domínio original e o site fica inacessível.

---

## Deep link

O botão "Usar cupom no Whoosh" usa o scheme `https://wsh.bike?pc={cupom}`:
- Abre o app direto na tela de ativação do cupom
- Se o app não estiver instalado, redireciona para a store
- Não usar `whoosh://` — não redireciona para a store se o app não estiver instalado

---

## Normalização de telefone

O número é normalizado em dois momentos:
1. **Frontend** — antes de enviar: remove não-dígitos, adiciona `55` se não começar com `55`
2. **Apps Script** — ao receber: mesma lógica, garante consistência

O usuário digita `(48) 99999-9999` → o webhook recebe e valida `554899999999`.

---

## Aprovação de go-live

Requer OK explícito de:
- **Victoria Aguiar** — Marketing (define mecânica e canal de envio)
- **Caetano Alves** — City Manager Floripa (solicitante)
- **Lucas Esquerdo** — Produto (desenvolvimento)

## Contato

Lucas Esquerdo — lesquerdo@whoosh.bike
