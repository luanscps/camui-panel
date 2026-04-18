# API Reference — camui-panel

> Endpoints server-side do painel. Todos os endpoints usam HTTPS.
> O app Android é o principal consumidor dessas APIs.

---

## Autenticação

### Endpoints públicos de auth (Supabase)

Gerenciados diretamente pelo Supabase Auth, consumidos pelo app Android via SDK:

| Ação | Método Supabase |
|---|---|
| Login | `supabase.auth.signInWithPassword` |
| Registro | `supabase.auth.signUp` |
| Logout | `supabase.auth.signOut` |
| Refresh token | automático via SDK |

---

## `POST /api/activate`

### Objetivo

Ativar o dispositivo Android na conta do usuário autenticado.
Gera ou reaproveita `sub_license_key` operacional para o aparelho.

### Autorização

```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

### Request Body

```json
{
  "device_name": "Galaxy S23",
  "device_brand": "Samsung",
  "device_model": "SM-S911B",
  "device_hardware": "qcom",
  "android_version": "14",
  "sdk_int": 34,
  "android_id": "abc123unique",
  "app_version": "5.0.0",
  "cameras": [
    {
      "id": "0",
      "facing": "back",
      "label": "wide",
      "max_resolution": "3840x2160",
      "max_fps": 60,
      "has_raw": true,
      "hardware_level": "FULL",
      "supports_manual_sensor": true,
      "iso_range": [50, 3200],
      "exposure_range_ns": [-10000000000, 10000000000],
      "focal_lengths": [1.7],
      "apertures": [1.8]
    }
  ]
}
```

### Campos obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `android_id` | string | Identificador único do aparelho (AndroidID) |
| `app_version` | string | Versão do app instalado |
| `cameras` | array | Lista de câmeras disponíveis no device |

### Campos opcionais

| Campo | Tipo | Descrição |
|---|---|---|
| `device_name` | string | Nome amigável do aparelho |
| `device_brand` | string | Fabricante (Samsung, Xiaomi…) |
| `device_model` | string | Modelo técnico |
| `device_hardware` | string | Chipset/hardware (qcom, exynos…) |
| `android_version` | string | Versão do Android |
| `sdk_int` | int | SDK level do Android |

### Regras de negócio

1. Valida o `accessToken` do usuário via `supabaseAdmin.auth.getUser`.
2. Busca a licença principal do usuário na tabela `licenses`.
3. Verifica se a licença está com `status = ACTIVE`.
4. Verifica se `expires_at` não foi ultrapassado.
5. Conta devices ativos e compara com `max_devices`.
6. Faz `upsert` em `device_activations` por identidade `(license_id, android_id)`.
7. Gera `sub_license_key` única se o device for novo.
8. Atualiza `last_seen_at`, `app_version`, `cameras` e metadados.
9. Dispara Edge Function `sync-phone-image` (fire-and-forget).

### Response — sucesso

```json
{
  "ok": true,
  "plan": "PRO",
  "max_devices": 5,
  "account_number": 123,
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "sub_license_key": "CAMUI-ABCD-EFGH-IJKL-MNOP",
  "status": "ACTIVE"
}
```

### Respostas de erro

| Status HTTP | Código | Motivo |
|---|---|---|
| 401 | `unauthorized` | Token ausente ou inválido |
| 403 | `no_active_license` | Licença inexistente, suspensa ou expirada |
| 403 | `device_limit_reached` | Limite de devices do plano atingido |
| 403 | `device_suspended` | Device específico está suspenso |
| 500 | `internal_error` | Erro inesperado no servidor |

```json
{
  "ok": false,
  "reason": "device_limit_reached",
  "max_devices": 1
}
```

---

## `GET /api/license/validate`

### Objetivo

Validar a sub-licença operacional do aparelho e retornar as features efetivas do plano.
Chamado pelo app a cada início de sessão e periodicamente durante operação.

### Autorização

```
Authorization: Bearer <sub_license_key>
```

### Sem body

Endpoint GET sem payload.

### Regras de negócio

1. Extrai `sub_license_key` do header `Authorization`.
2. Localiza o device em `device_activations` por `sub_license_key`.
3. Verifica `status` do device (`ACTIVE` ou `SUSPENDED`/`REVOKED`).
4. Carrega a licença principal associada.
5. Verifica `status` e `expires_at` da licença.
6. Carrega `plan_features` pelo `plan` da licença.
7. Atualiza `last_seen_at` de forma assíncrona (não bloqueia a resposta).
8. Retorna payload de autorização operacional.

### Response — sucesso

```json
{
  "ok": true,
  "plan": "PRO",
  "expires_at": "2026-12-31T00:00:00Z",
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "features": {
    "max_rtmp_outputs": 3,
    "max_resolution": "4K",
    "max_bitrate_kbps": 12000,
    "web_control": true,
    "local_recording": true,
    "max_stream_minutes": 0,
    "front_camera": true,
    "max_devices": 5
  }
}
```

### Campos de `features`

| Campo | Tipo | Descrição |
|---|---|---|
| `max_rtmp_outputs` | int | Máximo de destinos RTMP simultâneos |
| `max_resolution` | string | Resolução máxima permitida (`720p`, `1080p`, `4K`) |
| `max_bitrate_kbps` | int | Bitrate máximo em kbps |
| `web_control` | bool | WebGUI local habilitada |
| `local_recording` | bool | Gravação local habilitada |
| `max_stream_minutes` | int | Limite de minutos por stream (`0` = ilimitado) |
| `front_camera` | bool | Câmera frontal habilitada |
| `max_devices` | int | Máximo de devices na conta |

### Respostas de erro

| Status HTTP | Código | Motivo |
|---|---|---|
| 401 | `unauthorized` | Sub-licença ausente |
| 403 | `device_suspended` | Device suspenso ou revogado |
| 403 | `license_expired` | Licença da conta expirada |
| 403 | `no_active_license` | Licença inativa |
| 404 | `device_not_found` | Sub-licença não reconhecida |

---

## Matriz de planos — `plan_features`

Configuração de referência por plano:

| Feature | BASIC | PRO |
|---|---|---|
| `max_rtmp_outputs` | 1 | 3 |
| `max_resolution` | `1080p` | `4K` |
| `max_bitrate_kbps` | 4000 | 12000 |
| `web_control` | false | true |
| `local_recording` | false | true |
| `max_stream_minutes` | 60 | 0 (ilimitado) |
| `front_camera` | false | true |
| `max_devices` | 1 | 5 |

> Os valores reais são configurados na tabela `plan_features` e podem variar conforme atualização do produto.

---

## WebGUI local — endpoints do device

Servidos pelo `WebControlServer` (NanoHTTPD) diretamente no Android via HTTP local.

### Autenticação local

Cookie de sessão `CAMSESSION` gerado no login da WebGUI e validado em cada request protegido.

### Endpoints

| Endpoint | Método | Auth | Função |
|---|---|---|---|
| `/auth/login` | GET / POST | — | Login da WebGUI local |
| `/auth/logout` | GET | cookie | Logout da WebGUI local |
| `/` | GET | cookie | Shell HTML da interface local |
| `/style.css` | GET | — | CSS da WebGUI |
| `/app.js` | GET | — | JavaScript da WebGUI |
| `/status` | GET | cookie | Status básico resumido |
| `/api/status` | GET | cookie | Estado operacional completo (stream, câmera, heartbeat) |
| `/api/capabilities` | GET | cookie | Capabilities detalhadas por câmera/lente |
| `/api/plan` | GET | cookie | Plano ativo e features |
| `/api/control` | POST | cookie | Comandos operacionais de controle |

### `GET /api/status` — response

```json
{
  "streaming": true,
  "protocol": "RTMP",
  "rtmp_url": "rtmp://host/live/key",
  "camera_id": "0",
  "resolution": "1920x1080",
  "bitrate_kbps": 4500,
  "fps": 30,
  "uptime_seconds": 1234,
  "battery": 78,
  "thermal": "nominal"
}
```

### `GET /api/capabilities` — response

```json
{
  "cameras": [
    {
      "id": "0",
      "facing": "back",
      "label": "wide",
      "hardware_level": "FULL",
      "supports_manual_sensor": true,
      "max_resolution": "3840x2160",
      "max_fps": 60,
      "has_raw": true,
      "iso_range": [50, 3200],
      "focal_lengths": [1.7],
      "apertures": [1.8],
      "ois": true,
      "flash": true
    }
  ]
}
```

### `POST /api/control` — comandos

```json
{
  "action": "set_iso",
  "value": 800
}
```

| `action` | Parâmetros | Descrição |
|---|---|---|
| `set_iso` | `value: int` | Define ISO manualmente |
| `set_exposure` | `value: long (ns)` | Define tempo de exposição |
| `set_focus` | `value: float` | Define distância focal manual |
| `set_wb` | `mode: string` | Define modo de white balance |
| `set_zoom` | `value: float` | Define nível de zoom |
| `set_bitrate` | `value: int (kbps)` | Altera bitrate do encoder |
| `set_resolution` | `value: string` | Altera resolução |
| `toggle_flash` | `value: bool` | Liga/desliga flash |
| `toggle_ois` | `value: bool` | Liga/desliga OIS |
| `switch_camera` | `id: string` | Alterna entre câmeras |
| `start_stream` | — | Inicia streaming |
| `stop_stream` | — | Para streaming |
