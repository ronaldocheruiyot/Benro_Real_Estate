# BENRO Desktop — installable Windows app

This builds a **normal downloaded Windows installer** (`.exe`), with Desktop and Start Menu shortcuts — like other apps you install from a setup file.

## What you get

- `BENRO-Setup-1.0.0.exe` installer  
- App name: **BENRO Real Estate**  
- Runs **without Chrome / without internet**  
- Starts local API + UI inside the window  
- Still needs **MongoDB on this PC** for saving data  

## Build the installer (one command)

From the project root:

```powershell
npm run desktop:package
```

When it finishes, open the folder:

```
desktop\dist-installer\
```

You will get:

- `BENRO-Setup-1.0.0.exe` — Windows installer (Desktop + Start Menu shortcuts)
- `BENRO-Portable-1.0.0.exe` — single file you can run like a downloaded app (no install)

Double-click the Setup file → Next/Install → launch from Desktop shortcut,  
or just run the Portable `.exe`.

## After install

1. Start **MongoDB** on the PC (if it is not already running).  
2. Open **BENRO Real Estate** from the Desktop or Start Menu.  
3. Login with seeded accounts (e.g. `admin@company.com` / `admin123`) after running `npm run backend:seed` once on that machine.

## Dev (no installer)

```powershell
npm run desktop:offline
```
