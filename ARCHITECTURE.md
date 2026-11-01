# BENRO — Separated Frontend & Backend

The project is split into **two sides** so operations do not mix.

```
Benro_Real_Estate/
├── src/                 ← FRONTEND (React UI)
├── index.html
├── vite.config.ts
├── desktop/             ← Desktop window (loads frontend)
├── backend/             ← BACKEND (Express API + MongoDB)
│   ├── src/
│   ├── uploads/
│   └── .env
└── SETUP_AND_TEST_GUIDE.md
```

## Two processes (always)

| Side | Folder | Command | Port |
|------|--------|---------|------|
| **Backend** | `backend/` | `npm run backend` | `5000` |
| **Frontend** | `src/` (root) | `npm run frontend` | `5173` |

Optional desktop (offline-capable Electron window): `npm run desktop:offline`  
— packs the UI into `dist/`, starts local backend, no browser/internet required (local MongoDB still needed).

## Data flow

```
Frontend / Desktop ──HTTP + JWT──► Backend API ──► MongoDB
                                      │
                                      └──► backend/uploads/ (files)
```

- Frontend never opens MongoDB.
- Backend never serves the React UI (except static `/uploads`).
- Change UI code under `src/`. Change API/database code under `backend/`.

## Quick start

```powershell
# Terminal 1 — backend only
npm run backend

# Terminal 2 — frontend only
npm run frontend
```

See `backend/README.md` and `FRONTEND.md` for details.
