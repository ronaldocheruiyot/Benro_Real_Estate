# BENRO Backend (API)

This folder is the **backend only**. It does not run the React UI.

## Responsibility

- Connect to local MongoDB
- Authenticate users (JWT)
- CRUD for apartments, tenants, units, payments, users, documents, etc.
- Store uploaded images/documents under `uploads/`

## Run (from repo root)

```powershell
npm run backend
```

Or from this folder:

```powershell
cd backend
npm run dev
```

API base: `http://localhost:5000/api`  
Health: `http://localhost:5000/api/health`

## Seed demo data

```powershell
npm run backend:seed
```

## Config

Copy `.env.example` → `.env` if needed. Key values:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (default `5000`)

## Do not mix with frontend

| Backend (`backend/`) | Frontend (repo root `src/`) |
|----------------------|-----------------------------|
| Express + MongoDB    | React + Vite                |
| Port **5000**        | Port **5173**               |
| `npm run backend`    | `npm run frontend`          |
