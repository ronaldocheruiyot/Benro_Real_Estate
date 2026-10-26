# Benro real estate

React + Vite + Tailwind CSS frontend, with a **separate** Express/MongoDB backend.

## Two sides (do not mix)

| Side | Location | Command | Port |
|------|----------|---------|------|
| Frontend | `src/` | `npm run frontend` | 5173 |
| Backend | `backend/` | `npm run backend` | 5000 |

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Figma Make / frontend

A Vite development server may also run via Figma Make on `$PORT` (default 8443).

## Key Files

- `src/main.tsx` - Frontend entry
- `backend/src/index.js` - Backend API entry
- `vite.figma.config.ts` - Figma Make wrapper configuration
- `.mise.toml` - Toolchain versions

## Project Guidelines

Read and always follow the instructions in the [project guidelines](guidelines/Guidelines.md) unless the user requests otherwise.
