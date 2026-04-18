# Architecture — CAMUI Ecosystem

> **Escopo**: visão de sistema, planos técnicos, fluxos principais e decisões arquiteturais.
> Sem RTSP — pipeline operacional exclusivamente via **RTMP**.

---

## Visão geral do sistema

O ecossistema CAMUI é composto por três planos funcionais distintos:

| Plano | Componente | Responsabilidade |
|---|---|---|
| **Control plane** | `camui-panel` | Auth, licenças, inventário, admin, APIs |
| **Edge device plane** | `CAMSTREAMER-BR` | Captura Camera2, encode, RTMP, WebGUI local |
| **Distribution plane** | `MediaMTX` | Ingest RTMP, redistribuição downstream |

```mermaid
flowchart TD
    A[Usuário / Admin\nbrowser] --> B[camui-panel\nNext.js 15 + Supabase SSR]
    B <--> C[(Supabase\nAuth + Postgres\n+ Edge Functions)]
    D[CAMSTREAMER-BR\nAndroid + Camera2 + RTMP] -->|JWT do usuário| B
    B -->|sub_license_key + features| D
    D -->|RTMP publish| E[MediaMTX\ningest]
    E --> F[HLS / playback\ndistribuição downstream]
```

---

## camui-panel

### Stack

- Next.js 15 (App Router)
- React 19
- `@supabase/ssr` + `@supabase/supabase-js`
- Server Components por padrão
- Route Handlers para endpoints sensíveis

### Estrutura de rotas

```text
src/app/
  page.tsx                          → landing / redirect
  login/                            → auth pública
  register/                         → auth pública
  auth/callback/                    → callback OAuth/magic link
  api/
    activate/                       → POST: ativação de device Android
    license/validate/               → GET: validação de sub-licença
  (panel)/
    dashboard/
      devices/                      → inventário de dispositivos
      license/                      → licença da conta
      profile/                      → perfil do usuário
      admin/
        users/                      → gestão de usuários
        licenses/                   → gestão de licenças
        devices/                    → gestão de dispositivos
        plan-features/              → matriz de recursos por plano
```

### Camada de dados

```text
src/lib/supabase/
  client.ts     → createBrowserClient (componentes client)
  server.ts     → createServerClient (Server Components e Route Handlers)
```

### Middleware de autenticação

```mermaid
flowchart LR
    A[Request] --> B{pathname\nprotegido?}
    B -->|sim| C[supabase.auth.getUser]
    C --> D{user?}
    D -->|não| E[redirect /login\n?redirectTo=...]
    D -->|sim| F[next]
    B -->|/login\ne user existe| G[redirect /dashboard]
```

Proteção aplicada a: `/dashboard/**`, `/admin/**`.

---

## CAMSTREAMER-BR v5-CAMUI

### Stack Android

- Kotlin
- Camera2 API (acesso direto via `CameraManager`)
- RootEncoder / `RtmpCamera2` (captura + encode + publish)
- MediaCodec (encoder via biblioteca)
- NanoHTTPD (WebGUI local)
- EncryptedSharedPreferences (AES256-GCM)
- Foreground Service

### Camadas internas

```mermaid
flowchart TD
    A[LoginActivity\nRegisterActivity] --> B[LicenseRepository]
    B --> C[Supabase Auth]
    B --> D[/api/activate]
    B --> E[/api/license/validate]
    E --> F[SessionManager]
    F --> G[StreamingService]
    G --> H[Camera2Controller]
    G --> I[RtmpStreamer]
    G --> J[WebControlServer]
    H --> I
```

### Foreground Service

O `StreamingService` é o núcleo de runtime:

- mantém `Camera2Controller`, `RtmpStreamer` e `WebControlServer` vivos fora da Activity
- administra wake lock
- sobe notification foreground com canal dedicado
- disponibiliza singleton para reanexação da UI

### State machine recomendada

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> PREVIEW : câmera preparada
    PREVIEW --> STREAM_PREPARING : start solicitado
    STREAM_PREPARING --> STREAMING : RTMP conectado
    STREAMING --> PREVIEW : stop normal
    STREAM_PREPARING --> ERROR : falha de conexão
    STREAMING --> ERROR : queda de rede / encoder error
    ERROR --> PREVIEW : retry / reset
    PREVIEW --> IDLE : serviço encerrado
```

---

## MediaMTX

- Ponto de ingest RTMP vindo do Android
- Separação clara: o app **publica**, o MediaMTX **distribui**
- Downstream via HLS ou outro protocolo conforme configuração
- O painel não interage diretamente com o MediaMTX (sem RTSP no escopo)

---

## Decisões arquiteturais chave

| Decisão | Motivo |
|---|---|
| Android não grava diretamente no banco | Centraliza validação de plano e limite de devices no backend |
| `sub_license_key` por aparelho | Separa identidade da conta da identidade operacional do device |
| Server Components para dashboard | Evita exposição de dados sensíveis no cliente |
| Middleware SSR para auth | Proteção de rotas sem round-trip extra no cliente |
| Foreground Service para stream | Captura não depende da Activity estar visível |
| WebGUI via NanoHTTPD | Controle local em LAN sem depender do painel cloud |
| Edge Function para enriquecimento | Desacopla enriquecimento de metadados do fluxo crítico de ativação |

---

## Variáveis de ambiente

```env
# Público — seguro expor no browser
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Privado — apenas servidor Next.js
SUPABASE_SERVICE_ROLE_KEY=
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` nunca deve aparecer em componentes client, bundle ou logs.

---

## Diagrama completo de sequência — ciclo de vida do device

```mermaid
sequenceDiagram
    participant App as CAMSTREAMER-BR
    participant Auth as Supabase Auth
    participant Panel as camui-panel
    participant DB as Postgres
    participant EF as Edge Function
    participant MTX as MediaMTX

    App->>Auth: login(email, senha)
    Auth-->>App: accessToken

    App->>Panel: POST /api/activate { device_info, cameras }
    Panel->>DB: validar licença + upsert device_activations
    DB-->>Panel: sub_license_key gerada
    Panel->>EF: sync-phone-image (fire-and-forget)
    Panel-->>App: { plan, sub_license_key, features }

    loop A cada sessão / periodicamente
        App->>Panel: GET /api/license/validate
        Panel->>DB: validar sub_license_key + carregar plan_features
        Panel-->>App: { features efetivas, expires_at }
    end

    App->>MTX: RTMP publish rtmp://host/live/stream_key
    MTX-->>App: ingest established

    EF->>DB: atualizar phone_image_url + phone_specs
```
