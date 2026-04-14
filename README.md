# CamStreamer BR — Painel Web

Painel de licencas e administracao do app Android [CAMSTREAMER-BR](https://github.com/luanscps/CAMSTREAMER-BR).

## Stack

- **Framework:** Next.js 15 (App Router + TypeScript)
- **Backend/Auth/DB:** Supabase (Auth + Postgres + RLS)
- **Estilo:** Tailwind CSS
- **Deploy:** Vercel → `infrabr.site`

## Estrutura

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login do cliente
│   ├── register/page.tsx     # Cadastro
│   ├── dashboard/page.tsx    # Painel do cliente (licenca + devices)
│   ├── admin/page.tsx        # Painel admin (ver todas licencas)
│   └── auth/signout/route.ts # Logout
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client + Admin client
│   └── types/database.ts     # Tipos TypeScript das tabelas
└── middleware.ts              # Protecao de rotas
```

## Setup local

```bash
npm install
cp .env.example .env.local
# preencha as keys do Supabase em .env.local
npm run dev
```

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rqjxvzzfgoagcsxihdwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key  # NUNCA expor no frontend
NEXT_PUBLIC_SITE_URL=https://infrabr.site
```

## Deploy na Vercel

1. Importe este repositorio na Vercel
2. Adicione as variaveis de ambiente no painel da Vercel
3. Configure o dominio `infrabr.site` nas configuracoes do projeto
4. Faca deploy automatico a cada `git push main`

## Supabase — tabelas

| Tabela | Descricao |
|---|---|
| `profiles` | Perfil do usuario |
| `licenses` | Licenca BASIC/PRO por usuario |
| `device_activations` | Devices vinculados a licenca |

## RPC disponivel

```kotlin
// No app Android (Kotlin)
val result = supabase.postgrest.rpc("validate_license", mapOf("p_device_id" to deviceId))
```
