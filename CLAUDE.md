# CLAUDE.md

## Running

```bash
cd app && pnpm dev        # Frontend (Vite + React, port 5173)
cd functions && npm run serve  # Cloud Functions emulator
```

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 8, React Router 7, Tailwind 4, shadcn/ui |
| Backend | Firebase Cloud Functions v2 (Node 20, us-central1) |
| Auth | Firebase Auth + custom claims (`role`) |
| DB | Firestore |
| UI Icons | lucide-react |

## Architecture

```
app/src/
├── main.jsx / App.jsx          # Entry + role-based router
├── contexts/AuthContext.jsx    # Firebase Auth state, profile, role
├── hooks/                      # useUserProfile + StudentApp data/session hooks (ver catálogo abaixo)
├── lib/firebase.js             # Auth, Firestore, Functions init; call() helper
├── lib/confetti.js             # Canvas confetti burst (loop completo)
├── layouts/DashboardLayout.jsx # Prof/admin shell
├── pages/                      # Admin/prof pages (Dashboard, Alunos, Exercicios, Treinos, Ranking, Contas)
├── screens/                    # Role entry points (Login, Pending, StudentApp, ActiveWorkout, Hello)
├── services/                   # Thin wrappers over call() per domain
│   └── accounts / dashboard / exercises / ranking / sessions / users / workouts
├── components/ui/              # shadcn components (button, badge, checkbox, …)
├── components/student/         # StudentApp tab/overlay components (ver catálogo abaixo)
└── components/workout/         # ActiveWorkoutScreen components (ver catálogo abaixo)

functions/
├── index.js                    # Aggregates all exports
├── src/
│   ├── helpers.js              # requireAuth / requireAdmin / requireAdminOrProf
│   ├── auth.js                 # onUserCreate trigger, getMyRole, setUserRole
│   ├── students.js             # CRUD for user docs
│   ├── workouts.js             # Templates + student workout assignment
│   ├── exercises.js            # Exercise catalog CRUD
│   ├── sessions.js             # Session reads (student + recent activity)
│   ├── dashboard.js            # Aggregate stats
│   ├── ranking.js              # Ranking query
│   └── accounts.js             # Account management
└── scripts/
    ├── seed.js                 # Seed Firestore with demo data
    ├── assign-workouts.js      # Bulk workout assignment
    └── sync-claims.js          # Sync custom claims for all users
```

## Catálogo de Componentes — StudentApp / ActiveWorkout

Todo componente/hook aqui tem <150 linhas (ver Tamanho de Arquivo). **Reutilizar sempre** — não duplicar.

**Hooks (`app/src/hooks/`):**

| Arquivo | Responsabilidade |
|---|---|
| `useStudentData.js` | Carrega workouts/sessions/draft do Firestore |
| `useWorkoutCycle.js` | `getCycleInfo` (próximo treino + loops) e `lastWeightFor` |
| `useTrendData.js` | Pontos do gráfico SVG de intensidade (RPE) |
| `useSuggestions.js` | Sugestões de progressão de carga |
| `useActiveWorkoutSession.js` | Orquestra a sessão ativa (sets, RPE, salvar) |
| `useWorkoutTimers.js` | Cronômetro da sessão + contagem de descanso |
| `useWorkoutDraft.js` | Draft (`drafts/current`) + `switchWorkout` |
| `useSaveWorkoutSession.js` | Persiste sessão concluída no Firestore |
| `useEditWeight.js` | Estado/persistência do modal de ajustar carga |
| `useUploadPhoto.js` | Upload/crop de foto de perfil |
| `useCelebrateCycle.js` | Dispara confete ao completar o loop |

**Componentes (`app/src/components/student/`):**

| Arquivo | Responsabilidade |
|---|---|
| `HomeTab.jsx` / `WorkoutsTab.jsx` / `HistoryTab.jsx` / `ProfileTab.jsx` | As 4 abas do StudentApp |
| `BottomNav.jsx` | Barra de navegação inferior |
| `WorkoutListItem.jsx` | Linha "Treino X" (reusada em Home e Treinos) |
| `CycleTracker.jsx` | Dots + barra de progresso do loop |
| `DraftBanner.jsx` | Card "Treino pausado" |
| `TrendChart.jsx` | Gráfico SVG de RPE |
| `SuggestionsCard.jsx` | Card de sugestões de progressão |
| `WorkoutDetailOverlay.jsx` / `SessionReportOverlay.jsx` | Overlays full-bleed (detalhe do treino / relatório de sessão) |
| `EditWeightModal.jsx` | shadcn `Dialog` para ajustar carga padrão |
| `RpeTutorialSheet.jsx` | shadcn `Sheet` explicando o RPE |
| `shared.js` | Tokens de estilo + helpers (`diffColor`, `fmtDateFull`, …) |

**Componentes (`app/src/components/workout/`):**

| Arquivo | Responsabilidade |
|---|---|
| `ActiveWorkoutTopNav.jsx` | Header com nome do treino (toque abre `WorkoutSwitchSheet`) |
| `ActiveWorkoutMetrics.jsx` | Cards de Repetições/Carga |
| `WorkoutSwitchSheet.jsx` | shadcn `Sheet` pra trocar de treino em sessão ativa |
| `ExerciseList.jsx` / `ExerciseCard.jsx` | Lista de exercícios da sessão / linha individual do exercício |
| `RestOverlay.jsx`, `RpeOverlay.jsx`, `SummaryOverlay.jsx`, `ExitSheet.jsx`, `WeightSheet.jsx`, `VideoScreen.jsx` | Overlays/telas da sessão ativa |

## Roles & Routing

| Role | Route | Access |
|---|---|---|
| `pendente` | `/pending` | Waiting approval screen |
| `aluno` | `/student` | StudentApp (workouts, history, profile) |
| `professor` | `/prof/*` | DashboardLayout (no Contas) |
| `admin` | `/admin/*` | DashboardLayout (full, incl. Contas) |

- `RoleGate` at `/` redirects based on role from Firestore + custom claims
- `ProtectedRoute` wraps role-specific subtrees

## Firebase Helpers

```js
// lib/firebase.js
export const call = (name) => (data) => httpsCallable(fns, name)(data).then(r => r.data)

// Usage in services:
import { call } from "@/lib/firebase"
export const getStudents = call("getStudents")
```

## Firestore Schema

```
users/{uid}
  email, name, photoURL, role, active, createdAt, lastWorkout
  workouts/{wkId}   — label, name, color, exercises[], assignedAt, assignedBy, fromTemplateId
  sessions/{sessId} — date, duration, exercises[], rpe[]

wk_templates/{id}   — label, name, color, exercises[], createdBy, createdAt
invites/{email}     — role (consumed on onUserCreate, then deleted)
```

## Auth Flow

1. `onUserCreate` trigger → checks `invites/{email}` or pre-created user doc → sets role → `setCustomUserClaims`
2. Client: `AuthContext` watches `onAuthStateChanged` → `useUserProfile` fetches Firestore doc → syncs claims if stale
3. Functions guard with `requireAuth` / `requireAdminOrProf` / `requireAdmin` (checks `request.auth.token.role`)

## Design System — OBRIGATÓRIO

**Sempre usar shadcn/ui** para qualquer elemento de UI novo. Nunca criar botões, inputs, modais, badges, checkboxes ou dropdowns do zero.

- Adicionar componentes via `pnpm dlx shadcn@latest add <component>` dentro de `app/`
- Componentes ficam em `app/src/components/ui/` — nunca duplicar, sempre reutilizar
- Componentes compartilhados (Spinner, Avatar, Field) ficam em `app/src/components/shared.jsx`
- Para variantes novas, extender com `class-variance-authority` (CVA) no próprio arquivo do componente

### Padrões PROIBIDOS — nunca escrever isso:

```jsx
// ❌ input raw
<input style={...} />
<input className="..." />

// ❌ select raw
<select style={...}><option>...</option></select>

// ❌ Modal/Dialog custom (div + position fixed)
function Modal({ open, onClose, children }) { ... }
<div style={{ position: "fixed", inset: 0 }}>...</div>

// ❌ Avatar custom (div com inicial)
<div style={{ borderRadius: "50%", background: "var(--blue)" }}>{name[0]}</div>

// ❌ Spinner custom
<div className="animate-spin rounded-full border-..." />

// ❌ Label/Field custom
function Field({ label, children }) { return <div><label>...</label>{children}</div> }
```

### Padrões CORRETOS — usar sempre:

```jsx
// ✅ Input
import { Input } from "@/components/ui/input"
<Input value={v} onChange={...} placeholder="..." />

// ✅ Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<Select value={v} onValueChange={set}><SelectTrigger>...</SelectTrigger>...</Select>

// ✅ Dialog (modal)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
<Dialog open={open} onOpenChange={onClose}><DialogContent>...</DialogContent></Dialog>

// ✅ Avatar
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
<Avatar><AvatarImage src={photoURL} /><AvatarFallback>{name[0]}</AvatarFallback></Avatar>

// ✅ Spinner + Field
import { Spinner, Field } from "@/components/shared"

// ✅ Label
import { Label } from "@/components/ui/label"
<Label htmlFor="x">Nome</Label><Input id="x" />
```

**Design tokens — usar sempre, nunca hardcodar cores:**

```css
--bg:#06091a  --bg2:#0b1228  --bg3:#162040
--acc:#F5C400
--blue:#1B3487  --blue2:#2352c8
--green:#00c853  --red:#f44336
--sub: (texto secundário)
```

- Classes Tailwind devem referenciar os tokens via `style={{ color: "var(--acc)" }}` ou via CSS custom properties — nunca `text-yellow-400` ou similares
- Ícones: sempre `lucide-react`, tamanho padrão `size={16}` ou `size={20}`

## Tamanho de Arquivo — OBRIGATÓRIO

- Todo arquivo que for editado deve ficar com **menos de 150 linhas** ao final da mudança.
- Sempre quebrar em componentes menores (usando shadcn/ui, ver Design System acima) em vez de deixar um arquivo crescer.
- Ao tocar um arquivo acima do limite, extrair partes para novos componentes/hooks como parte da mudança — não apenas adicionar código ao arquivo grande.

## Constraints

- Mobile-first: max-width 430px (StudentApp); admin/prof uses full-width dashboard
- Rest timers: 30s (sets) / 45s (exercises) — hardcoded
- Weight increment: 2.5kg — hardcoded
- RPE scale 0–10; weight increase suggested at average ≤ 4
- Passwords: Firebase Auth (Google/Email) — no plaintext

<!-- token-policy: v1.0 -->
