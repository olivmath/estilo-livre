# CLAUDE.md

## Running

```bash
open index.html
```
Reset: `localStorage.clear(); location.reload()` (no browser console)

## Architecture

No build, no npm. Multi-file in `app/` with 3 roles.

```
app/
├── index.html                  # Role router
├── admin/
│   ├── index.html / css/main.css
│   └── js/
│       ├── globals.js          # DB, U, PAL
│       ├── auth.js / navigation.js / helpers.js / mock.js
│       ├── dashboard.js / alunos.js / admins.js
│       ├── treinos.js / exercicios.js / ranking.js
│       └── screens/shell.js / login.js / modals.js
├── user/
│   ├── index.html / css/main.css
│   └── js/
│       ├── globals.js          # DB, U, A, PAL
│       ├── auth.js / navigation.js / data.js
│       ├── workouts.js / exercises.js / active.js
│       ├── weight.js / sheets.js / renders.js / report.js / init.js
│       └── screens/nav.js / login.js / home.js / workouts.js
│                  active.js / profile.js / sheets.js / overlays.js
└── prof/index.html             # Trainer stub
```

## Globals

| Symbol | Role |
|---|---|
| `DB` | `DB.get(key, default)` / `DB.set(key, val)` over localStorage JSON |
| `U` | Current logged-in user (`null` when logged out) |
| `A` | Active workout session (singleton) |
| `PAL` | Color palette array |

## localStorage Keys

| Key | Content |
|---|---|
| `users` | `{ [email]: { name, email, pw } }` |
| `cu` | Current user session |
| `wk_<email>` | Workout objects array |
| `sess_<email>` | Completed session objects array |
| `photo_<email>` | Base64 JPEG profile photo |

## Routing

- `nav(screenId, btnEl)` — shows `.screen#screenId`, hides others, updates nav
- Screens: `home`, `workouts`, `detail`, `active`, `profile`
- `openSheet(id)` / `closeSheet(id)` — toggles `.active` on `.so` + `.sheet`

## Render Pattern

Full re-render on state change (no vDOM): `renderHome()` / `renderWorkouts()` / `renderExercises()` / `renderProfile()`

## Active Workout Flow

1. `startWorkout(wkId)` → populates `A`, calls `renderActiveEx()`
2. `nextSet()` → advances `A.set`; all sets done → `showDiff(ex)` (RPE slider)
3. `confirmDiff()` → saves RPE, advances `A.exIdx`, calls `renderActiveEx()`
4. `buildAndShowSummary()` → shows report overlay when all exercises done
5. `saveAndFinish()` → appends to `sess_<email>`, resets `A`

## Design Tokens

```
--bg:#06091a  --bg2:#0b1228  --bg3:#162040
--acc:#F5C400
--blue:#1B3487  --blue2:#2352c8
--green:#00c853  --red:#f44336
```

## Constraints

- Mobile-first: max-width 430px, no desktop layout
- No backend: all data local; multi-device sync out of scope
- Passwords plaintext — intentional (gym-kiosk use case)
- Rest timers: 30s (sets) / 45s (exercises) — hardcoded in `startRest`
- Weight increment: 2.5kg — hardcoded in `adjW`
- RPE scale 0–10; weight increase suggested at average ≤ 4

<!-- token-policy: v1.0 -->
