# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

```bash
open index.html          # open in default browser
# or drag index.html into any browser — no server needed
```

To reset all data during development:

```js
// In browser DevTools console
localStorage.clear(); location.reload();
```

## Architecture

**Multi-file app** reorganized into `app/` with 3 roles. No build step, no npm, no dependencies.

### File map

```
app/
├── index.html                  # Role router (redirects to admin/user/prof)
├── admin/
│   ├── index.html
│   ├── css/main.css
│   ├── js/
│   │   ├── globals.js          # DB, U, PAL globals
│   │   ├── auth.js             # Login / session
│   │   ├── navigation.js       # nav() routing
│   │   ├── helpers.js          # Utility functions
│   │   ├── mock.js             # Seed data
│   │   ├── dashboard.js        # Dashboard logic
│   │   ├── alunos.js           # Student management
│   │   ├── admins.js           # Admin management
│   │   ├── treinos.js          # Workout templates
│   │   ├── exercicios.js       # Exercise catalog
│   │   └── ranking.js          # Ranking logic
│   └── screens/
│       ├── shell.js            # App shell / layout
│       ├── login.js            # Login screen
│       └── modals.js           # All modal/sheet HTML
├── user/
│   ├── index.html
│   ├── css/main.css
│   ├── js/
│   │   ├── globals.js          # DB, U, A, PAL globals
│   │   ├── auth.js             # Login / session
│   │   ├── navigation.js       # nav() routing
│   │   ├── data.js             # localStorage helpers
│   │   ├── workouts.js         # Workout CRUD
│   │   ├── exercises.js        # Exercise CRUD
│   │   ├── active.js           # Active session state (A)
│   │   ├── weight.js           # adjW(), weight progression
│   │   ├── sheets.js           # openSheet/closeSheet
│   │   ├── renders.js          # renderHome/Workouts/Profile
│   │   ├── report.js           # buildAndShowSummary, saveAndFinish
│   │   └── init.js             # App bootstrap
│   └── screens/
│       ├── nav.js              # Bottom nav HTML
│       ├── login.js            # Login screen
│       ├── home.js             # Home screen
│       ├── workouts.js         # Workouts screen
│       ├── active.js           # Active workout screen
│       ├── profile.js          # Profile screen
│       ├── sheets.js           # Bottom sheet HTML
│       └── overlays.js         # Full-screen overlays
└── prof/
    └── index.html              # Trainer role (stub)
```

### JS structure (inside `<script>` at line ~360)

| Symbol | Role |
|---|---|
| `DB` | Thin wrapper: `DB.get(key, default)` / `DB.set(key, val)` over `localStorage` JSON |
| `U` | Current logged-in user object (`null` when logged out) |
| `A` | Active workout session state (singleton object) |
| `PAL` | Color palette array for workout color picker |

### localStorage keys

| Key | Content |
|---|---|
| `users` | `{ [email]: { name, email, pw } }` |
| `cu` | Current user object (session persistence) |
| `wk_<email>` | Array of workout objects for that user |
| `sess_<email>` | Array of completed session objects for that user |
| `photo_<email>` | Base64 JPEG profile photo |

### Screen routing

`nav(screenId, btnEl)` — shows the `.screen#screenId` div, hides all others, updates bottom nav active state. Screens: `home`, `workouts`, `detail`, `active`, `profile`.

Bottom sheets (modals) use `openSheet(id)` / `closeSheet(id)` — toggles `.active` class on `.so` overlay and `.sheet` panel.

### Render pattern

Full re-render on state change — no virtual DOM, no framework:
- `renderHome()` — dashboard, trend chart, history
- `renderWorkouts()` — workout list
- `renderExercises()` — exercise list for `editWkId`
- `renderProfile()` — profile screen

### Active workout flow

1. `startWorkout(wkId)` — populates `A`, calls `renderActiveEx()`
2. `nextSet()` — advances `A.set`; when all sets done, calls `showDiff(ex)` (RPE slider)
3. `confirmDiff()` — saves RPE, advances `A.exIdx`, calls `renderActiveEx()`
4. `buildAndShowSummary()` — when all exercises done, shows report overlay
5. `saveAndFinish()` — appends to `sess_<email>`, resets `A`

### Design tokens (CSS vars)

```
--bg:#06091a  --bg2:#0b1228  --bg3:#162040   (dark backgrounds)
--acc:#F5C400                                 (yellow accent)
--blue:#1B3487  --blue2:#2352c8              (blue range)
--green:#00c853  --red:#f44336               (status colors)
```

## Key constraints

- **Mobile-first**: max-width 430px, no desktop layout
- **No backend**: all data is local to the browser; multi-device sync is out of scope
- **Passwords stored in plaintext** in localStorage — intentional for this gym-kiosk use case, not a bug to fix
- Rest timers: 30s between sets, 45s between exercises (hardcoded in `startRest`)
- Weight increment: 2.5kg (hardcoded in `adjW`)
- RPE scale: 0–10; suggestions to increase weight trigger at average ≤ 4
