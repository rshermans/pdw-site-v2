# Instruções para Domingos — Envio de Email e DNS

**Projeto:** PDW Site — Portuguese Digital Wallet  
**Data:** 24 de junho de 2026  
**De:** Romulo (Gestor do Projeto)  
**Para:** Domingos (Administrador de Sistemas)

Preciso da tua ajuda com duas ações, descritas abaixo.  
Podes fazer as duas em paralelo ou começar pela **Opção A** (mais urgente).

---

## Opção A — URGENTE: Restaurar envio de emails (Gmail SMTP)

O site deixou de enviar emails de confirmação de inscrição aos utilizadores.  
A causa é que as credenciais de email não estão presentes no servidor.

### O que precisas de fazer

Na VPS, dentro da pasta raiz do projeto (`/caminho/para/pdw-site-v2/`), cria ou edita o ficheiro `.env.production.local` com o seguinte conteúdo:

```
SMTP_USER=eventospdw@gmail.com
SMTP_PASS=csjr xobc swtg gver
```

> **Nota:** O valor de `SMTP_PASS` é uma App Password do Gmail (16 caracteres com espaços) — não é a password da conta Google. Deve ser guardada exatamente como está, incluindo os espaços.

Depois, ainda na pasta do projeto, executa:

```bash
npm run build
pm2 restart pdw_www
```

### Como verificar que ficou resolvido

1. Entra numa página de inscrição de evento no site
2. Faz uma inscrição de teste com um email real
3. Verifica se o email de confirmação chega à caixa de entrada

---

## Opção B — Verificação de domínio no Resend (serviço de email)

Para melhorar a entregabilidade dos emails futuramente (e usar o domínio `digitalwallet.pt` como remetente em vez de Gmail), precisamos verificar o domínio `digitalwallet.pt` junto ao serviço Resend.

Isso é feito adicionando registos DNS na zona do domínio `digitalwallet.pt` na OVHCloud.

### Registos DNS a adicionar

Acede ao painel OVHCloud → Web Cloud → Domínios → `digitalwallet.pt` → Zona DNS e adiciona os seguintes registos:

---

#### 1. DKIM (autenticação de email) — Obrigatório

| Campo    | Valor                                                                                                                                   |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Tipo     | `TXT`                                                                                                                                   |
| Nome     | `resend._domainkey`                                                                                                                     |
| Conteúdo | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDjQIllYFdqIRRwBnjsukBAJGGhAKdakTaOlxdGut7jC6m7bR3gFfjNfnidC9Joq7Rc9D/vQ3u5L/rJeLYvyV6+mw34joEKhVRSX8sI9CDdITZ2Dnj0UABy6wam9DH1/s5vqeuq4jRd2iFT63RgrdXR/kYs2Iv74p3WnEguEUFIVwIDAQAB` |
| TTL      | Auto                                                                                                                                    |

---

#### 2. MX — Para rastreio de bounces (devoluções)

| Campo      | Valor                                        |
|------------|----------------------------------------------|
| Tipo       | `MX`                                         |
| Nome       | `send`                                       |
| Conteúdo   | `feedback-smtp.eu-west-1.amazonses.com`      |
| TTL        | Auto                                         |
| Prioridade | `10`                                         |

---

#### 3. SPF — Autoriza o Resend a enviar em nome do domínio

| Campo    | Valor                             |
|----------|-----------------------------------|
| Tipo     | `TXT`                             |
| Nome     | `send`                            |
| Conteúdo | `v=spf1 include:amazonses.com ~all` |
| TTL      | Auto                              |

---

#### 4. DMARC — Política de email (opcional mas recomendado)

| Campo    | Valor              |
|----------|--------------------|
| Tipo     | `TXT`              |
| Nome     | `_dmarc`           |
| Conteúdo | `v=DMARC1; p=none;` |
| TTL      | Auto               |

---

### Após adicionares os registos

Avisa-me quando os registos estiverem adicionados.  
A propagação DNS pode demorar entre 5 minutos e 1 hora.  
Depois verifico do meu lado no painel do Resend e confirmo se ficou tudo verde.

---

## Resumo das Prioridades

| Prioridade | Ação | Impacto |
|------------|------|---------|
| 🔴 Urgente | Opção A — criar `.env.production.local` + rebuild | Restaura emails de confirmação imediatamente |
| 🟡 Importante | Opção B — adicionar 4 registos DNS na OVH | Prepara envio de emails pelo domínio próprio |

Qualquer dúvida, contacta-me diretamente.  
Obrigado!
