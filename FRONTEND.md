# BENRO Frontend (Web UI)

This is the **frontend only** — React + Vite + Tailwind in the repo root (`src/`).

It talks to the backend over HTTP. It does **not** talk to MongoDB directly.

## Responsibility

- Login screen and role-based pages
- Forms for tenants, apartments, units, payments, etc.
- Calls `http://localhost:5000/api` with a JWT

## Run (from repo root)

```powershell
npm run frontend
```

Open: [http://localhost:5173](http://localhost:5173)

The backend must already be running (`npm run backend`) or login/data calls will fail.

## Desktop shell

Electron (`desktop/`) is only a window around this same frontend. It is not the API.

```powershell
npm run desktop
```

## Do not mix with backend

| Frontend | Backend |
|----------|---------|
| `src/`, `index.html`, Vite | `backend/` |
| Port **5173** | Port **5000** |
| `npm run frontend` | `npm run backend` |
