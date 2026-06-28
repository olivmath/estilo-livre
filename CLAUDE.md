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
├── hooks/useUserProfile.js     # Firestore user doc fetch
├── lib/firebase.js             # Auth, Firestore, Functions init; call() helper
├── layouts/DashboardLayout.jsx # Prof/admin shell
├── pages/                      # Admin/prof pages (Dashboard, Alunos, Exercicios, Treinos, Ranking, Contas)
├── screens/                    # Role entry points (Login, Pending, StudentApp, ActiveWorkout, Hello)
├── services/                   # Thin wrappers over call() per domain
│   └── accounts / dashboard / exercises / ranking / sessions / users / workouts
└── components/ui/              # shadcn components (button, badge, checkbox, …)

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
- Para variantes novas, extender com `class-variance-authority` (CVA) no próprio arquivo do componente

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

## Constraints

- Mobile-first: max-width 430px (StudentApp); admin/prof uses full-width dashboard
- Rest timers: 30s (sets) / 45s (exercises) — hardcoded
- Weight increment: 2.5kg — hardcoded
- RPE scale 0–10; weight increase suggested at average ≤ 4
- Passwords: Firebase Auth (Google/Email) — no plaintext

<!-- token-policy: v1.0 -->
