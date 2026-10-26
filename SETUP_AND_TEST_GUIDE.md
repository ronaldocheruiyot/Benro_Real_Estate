# BENRO Real Estate — Setup, Web & Desktop Guide

Frontend and backend are **separate sides**. Do not mix their folders or run scripts.

| Side | Folder | Command | Port |
|------|--------|---------|------|
| **Backend** | `backend/` | `npm run backend` | `5000` |
| **Frontend** | `src/` (root) | `npm run frontend` | `5173` |
| Desktop | `desktop/` | `npm run desktop` | (loads frontend) |
| Database | MongoDB | local service | `27017` |

Uploads live only on the backend: `backend/uploads/`.

---

## 1. Prerequisites

1. **Node.js 20+**
2. **MongoDB** running locally
3. **npm**

```powershell
mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## 2. Install dependencies

From the project root:

```powershell
cd C:\Users\Hp\Benro_Real_Estate

npm install
npm install --prefix backend
npm install --prefix desktop
```

---

## 3. Seed the database (backend only)

```powershell
npm run backend:seed
```

### Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@company.com` | `admin123` |
| Manager | `manager@company.com` | `manager123` |
| Caretaker | `caretaker@company.com` | `caretaker123` |
| Accountant | `accountant@company.com` | `accountant123` |

---

## 4. Run backend and frontend on different terminals

**Terminal A — Backend only**

```powershell
npm run backend
```

Expect: `BENRO API listening on http://localhost:5000`

**Terminal B — Frontend only**

```powershell
npm run frontend
```

Open: [http://localhost:5173](http://localhost:5173)

Health check (backend): [http://localhost:5000/api/health](http://localhost:5000/api/health)

Aliases still work: `npm run api` → backend, `npm run web` → frontend.

---

## 5. Desktop application

With backend + frontend already running:

```powershell
npm run desktop
```

Electron opens the same frontend UI; all data still goes through the backend API.

---

## 6. Prove-it test checklist

1. **Login** — JWT from backend; refresh stays logged in.
2. **Dashboard** — apartments from MongoDB via API.
3. **Add apartment / tenant / unit / payment** — each hits `backend` then MongoDB.
4. **Users / adverts / land / documents** — same pattern.
5. **Uploads** — files under `backend/uploads/`.
6. **Desktop** — same data as the browser.

```powershell
mongosh benro_real_estate --eval "db.tenants.find().pretty()"
```

---

## 7. Configuration

| File | Side | Purpose |
|------|------|---------|
| `backend/.env` | Backend | `MONGODB_URI`, `JWT_SECRET`, `PORT` |
| `.env` (root) | Frontend | `VITE_API_URL=http://localhost:5000/api` |
| `desktop/main.js` | Desktop | `BENRO_WEB_URL` if needed |

---

## 8. npm scripts (root)

| Script | Side |
|--------|------|
| `npm run backend` | Backend API (watch) |
| `npm run backend:seed` | Seed MongoDB |
| `npm run frontend` | Web UI |
| `npm run desktop` | Electron shell |

More detail: `ARCHITECTURE.md`, `backend/README.md`, `FRONTEND.md`.
