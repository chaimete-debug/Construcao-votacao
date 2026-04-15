# 🗳️ App de Votação para Reuniões

App simples para o teu grupo votar no melhor dia para uma reunião.

## Como funciona

1. **Admin** acede a `/admin`, define título, datas e cria a votação
2. **Partilha** o link (`/`) no grupo (WhatsApp, Telegram, etc.)
3. **Membros** acedem e votam com o nome + data preferida
4. **Resultados** visíveis em tempo real em `/resultados`

---

## Deploy no Vercel (passo a passo)

### 1. Faz fork / upload do código para o GitHub

- Cria um repositório no [github.com](https://github.com)
- Faz upload de todos os ficheiros ou usa `git push`

### 2. Cria o projeto no Vercel

- Vai a [vercel.com](https://vercel.com) e faz login com o GitHub
- Clica em **"Add New Project"**
- Escolhe o repositório que criaste
- Clica em **Deploy** (as definições padrão funcionam)

### 3. Cria a base de dados KV (gratuita)

No dashboard do Vercel:
- Vai a **Storage → Create Database → KV**
- Dá um nome (ex: `voting-db`)
- Clica em **Connect to Project** e escolhe o teu projeto
- O Vercel adiciona automaticamente as variáveis de ambiente necessárias (`KV_URL`, etc.)

### 4. Define a senha de admin

Ainda no Vercel, vai a **Settings → Environment Variables** e adiciona:

| Nome | Valor |
|------|-------|
| `ADMIN_SENHA` | uma senha à tua escolha (ex: `grupo2024`) |

Depois vai a **Deployments → Redeploy** para aplicar as variáveis.

### 5. Usa o app

- Acede a `https://teu-app.vercel.app/admin`
- Cria a votação com as datas e a senha
- Copia o link `https://teu-app.vercel.app/` e envia no grupo
- Vê os resultados em `https://teu-app.vercel.app/resultados`

---

## Desenvolvimento local

```bash
npm install
# Cria .env.local com as tuas variáveis KV (obtidas no dashboard Vercel)
npm run dev
```

## Tecnologias

- **Next.js 14** — framework React
- **Vercel KV** — base de dados Redis (plano gratuito suporta 30k pedidos/mês)
- **TypeScript** — tipagem estática
