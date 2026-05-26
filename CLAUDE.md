# webapp-cupom-floripa — Claude Intelligence File

Assistente de desenvolvimento do webapp de resgate de cupom Whoosh Florianópolis.

---

## 1. PROJECT CONSTANTS

### Stack
- **Frontend:** HTML5 + CSS3 + Vanilla JS (sem framework — manter simples)
- **Backend:** Google Apps Script (webhook) → Google Sheets
- **Hosting:** GitHub Pages (`lesquerdo-whoosh/webapp-cupom-floripa`)
- **ClickUp:** [86e1hnfpc — MVP webapp de resgate de cupom Floripa](https://app.clickup.com/t/86e1hnfpc)

### Design System — Whoosh Brand
```
yellow:    #ffb928   (Whoosh trademark yellow — cor primária)
yellow-bg: #fffbeb   (tint para surfaces)
steel:     #1a2332   (Whoosh Steel — texto principal)
navy:      #0f172a   (dark background — header)
muted:     #64748b   (texto secundário)
border:    #e2e8f0
bg:        #f8fafc
white:     #ffffff
success:   #16a34a
```

**Regra crítica de contraste:** texto sobre `#ffb928` é sempre `#1a2332` (escuro). Nunca texto branco ou claro sobre amarelo.

- **Fonte:** DM Sans (Google Fonts) — substituto web do Nekst Medium (fonte proprietária Whoosh)
- **Key visual:** linha amarela `#ffb928` de 3px abaixo de títulos — elemento tipográfico do Brand Guidelines
- **Logo:** `whoosh-logo.png` — wordmark oficial; usar sempre sobre fundo `#0f172a`

### Placeholders ativos
- Instrução de uso do cupom — confirmar fluxo no app Whoosh ("Carteira → Cupons" a confirmar)
- Canal de envio do link — não afeta o webapp

### Decisões confirmadas (não alterar)
- **Cupom único por usuário** — coluna `cupom` na aba Whitelist, preenchida pela Whoosh Russia. Apps Script lê diretamente dessa coluna — sem mapa por segmento.
- **Desconto único (40%)** — sem diferenciação por segmento para o usuário. Segmento (`1-viagem` / `2-3-viagens`) é gravado em Resgates apenas para analytics.
- **Campo nome removido** — formulário coleta só telefone. Resgates grava: timestamp, telefone, segmento, cupom.
- **Já resgatado exibe o cupom** — ao redigitar o telefone, o usuário vê seu código novamente.

### Mobile — Primeira Classe
O link será enviado via WhatsApp/EDNA — **a maioria dos acessos é mobile.**
- Validar toda mudança em 320px e 390px antes de considerar pronta
- Touch targets: `min-height: 44px` em todos os elementos interativos
- Font floor: 12px para labels e metadata — nunca abaixo
- `min-width: min(Xpx, 100%)` em flex children — nunca pixel puro que force overflow

---

## 2. TECH LEAD

### Antes de qualquer mudança
- Qual o esforço? (pequeno <1h · médio 1–3h · grande >3h)
- Risco de regressão? Testar formulário + webhook + tela de sucesso após qualquer alteração
- A mudança mantém o webapp funcional sem backend (webhook URL pode falhar)?
- Critério de "pronto": formulário submete → linha aparece na Sheet → cupom exibe na tela

### Regras permanentes
- **Sem dependências npm** — se não resolve em vanilla JS, justificar antes de adicionar biblioteca
- **Sem frameworks** — Next.js, React, Vue estão fora do escopo; manter HTML/CSS/JS puro
- **Graceful degradation:** se o webhook falhar, o erro deve ser claro e com instrução útil — nunca tela em branco
- **Sem largura fixa sem fallback:** nunca `width: Npx` em elementos sem `min()` ou `clamp()` como guarda mobile

---

## 3. UX / DESIGN LEAD

### Estados obrigatórios em toda interação
O usuário deve saber o que está acontecendo **em todo momento:**
- **Loading:** botão desabilitado + texto "Enviando…" — nunca clique duplo silencioso
- **Erro:** mensagem útil + caminho de saída (retry visível) — nunca tela muda sem feedback
- **Sucesso:** transição clara de estado form → cupom — nunca ambiguidade se funcionou

### Formulários
- Validação inline progressiva — não apenas no submit
- Erros aparecem no campo, não só no topo da página
- Ações destrutivas (se houver reset): confirmação explícita — nunca undo silencioso
- Onboarding: coletar apenas o necessário — não exigir dados além do mínimo funcional

### Animações e micro-interações
- Micro-interações: 80–150ms; transições de estado: 200–350ms
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — nunca `linear` para animações perceptíveis
- Toda animação respeita `prefers-reduced-motion` — sempre implementar fallback sem movimento
- Entry animation padrão: `opacity 0→1` + `translateY(6px→0)`, 300ms, easing acima

### Mobile UX
- Touch targets mínimos: 44px de altura em botões e inputs
- Sem elementos cortados ou inacessíveis em 320px
- Formulário deve funcionar com teclado virtual aberto — usar `min-height: 100dvh` (não `100vh`)

### Checklist antes de considerar feature "pronta"
- [ ] Loading state implementado
- [ ] Erro state com mensagem útil
- [ ] Sucesso state claro
- [ ] Funciona em 320px sem overflow horizontal
- [ ] Touch targets ≥ 44px
- [ ] Animações com `prefers-reduced-motion` respeitado
- [ ] Nenhuma cor hardcoded fora dos tokens do design system

---

## 4. QA

### Casos de teste obrigatórios após qualquer mudança
1. **Happy path:** preenche nome + telefone → clica → vê cupom → linha aparece na Sheet
2. **Campo vazio:** tentar submeter sem nome ou sem telefone — validação deve barrar
3. **Duplo clique:** clicar submit rapidamente 2x — deve enviar apenas 1 vez
4. **Webhook indisponível:** simular falha (URL errada) — deve mostrar erro, não tela branca
5. **Mobile 320px:** sem overflow horizontal, sem elementos cortados
6. **Mobile 390px:** teclado virtual aberto não quebra o layout

### Regras
- Após qualquer mudança de CSS: verificar no Chrome DevTools em 320px e 390px
- Após qualquer mudança de JS: testar submit com dados válidos e inválidos
- Após qualquer mudança no webhook URL: verificar que linha aparece na Sheet

---

## 5. GIT & GITHUB WORKFLOW

### Commits
```
<type>: <descrição curta>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Tipos: `feat` · `fix` · `design` · `docs` · `chore`

Para commits que fecham issues, incluir `closes #N` no corpo.

### Issues
- Abrir issue antes de trabalhar em qualquer feature nova não-trivial
- Linkar sempre com o ClickUp: `> **ClickUp:** [86e1hnfpc](https://app.clickup.com/t/86e1hnfpc)`
- Fechar issue com comentário de resolução ao concluir

---

## 6. TOKEN EFFICIENCY

- **Grep antes de Read** — localizar linhas relevantes antes de ler arquivo inteiro
- **Sem releituras** — dentro de uma sessão, não reler arquivos já lidos
- **Escopo de review = arquivos alterados** — nunca review completo sem pedido explícito
- **Output de agente:** resultado + recomendação — nunca stream-of-consciousness

---

## 7. MANUTENÇÃO DESTE ARQUIVO

Atualizar quando:
- Placeholder confirmado por Vic → atualizar seção "Placeholders ativos"
- Nova decisão técnica permanente (campo extra, novo webhook, domínio próprio)
- Regra de UX ou QA nova derivada de bug real em produção

Não atualizar por obrigação — só quando houver mudança real e permanente.
