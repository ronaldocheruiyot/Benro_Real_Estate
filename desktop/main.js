const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

const API_PORT = Number(process.env.BENRO_API_PORT || 5000);
const DEV_WEB_URL = process.env.BENRO_WEB_URL || "http://localhost:5173";

let mainWindow = null;
let apiProcess = null;

function isPackaged() {
  return app.isPackaged;
}

/** Project root in dev; resources folder when installed as a downloaded app */
function resourceRoot() {
  if (isPackaged()) return process.resourcesPath;
  return path.resolve(__dirname, "..");
}

function uiDistIndex() {
  if (isPackaged()) {
    return path.join(resourceRoot(), "ui", "index.html");
  }
  return path.join(resourceRoot(), "dist", "index.html");
}

function backendEntry() {
  if (isPackaged()) {
    return path.join(resourceRoot(), "backend", "src", "index.js");
  }
  return path.join(resourceRoot(), "backend", "src", "index.js");
}

function backendCwd() {
  if (isPackaged()) {
    return path.join(resourceRoot(), "backend");
  }
  return path.join(resourceRoot(), "backend");
}

function isDevMode() {
  return process.env.BENRO_DESKTOP_DEV === "1" || (!isPackaged() && !fs.existsSync(uiDistIndex()));
}

function waitForApi(timeoutMs = 25000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`http://127.0.0.1:${API_PORT}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve(true);
        else retry();
      });
      req.on("error", retry);
      req.setTimeout(1500, () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error("Local backend did not start in time"));
        return;
      }
      setTimeout(tick, 400);
    };
    tick();
  });
}

function startLocalBackend() {
  const entry = backendEntry();
  const cwd = backendCwd();
  if (!fs.existsSync(entry)) {
    throw new Error(`Backend not found at:\n${entry}`);
  }

  const userData = app.getPath("userData");
  const uploadDir = path.join(userData, "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  apiProcess = spawn(process.execPath, [entry], {
    cwd,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(API_PORT),
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/benro_real_estate",
      JWT_SECRET: process.env.JWT_SECRET || "benro_desktop_jwt_secret_change_me",
      CLIENT_ORIGIN: "*",
      UPLOAD_DIR: uploadDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  apiProcess.stdout.on("data", (buf) => console.log(`[backend] ${String(buf).trim()}`));
  apiProcess.stderr.on("data", (buf) => console.error(`[backend] ${String(buf).trim()}`));
  apiProcess.on("exit", (code) => {
    console.log(`[backend] exited (${code})`);
    apiProcess = null;
  });
}

function stopLocalBackend() {
  if (!apiProcess || apiProcess.killed) return;
  try {
    apiProcess.kill();
  } catch {
    // ignore
  }
  apiProcess = null;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 980,
    minHeight: 680,
    title: "BENRO Real Estate",
    backgroundColor: "#10184f",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDevMode()) {
    await mainWindow.loadURL(DEV_WEB_URL);
  } else {
    await mainWindow.loadFile(uiDistIndex());
  }
}

app.whenReady().then(async () => {
  try {
    startLocalBackend();
    await waitForApi();
  } catch (err) {
    dialog.showErrorBox(
      "BENRO could not start",
      `${err.message}\n\nThis app runs fully on your PC (no internet).\nPlease start MongoDB locally, then open BENRO again.`
    );
  }

  try {
    await createWindow();
  } catch (err) {
    dialog.showErrorBox("BENRO Desktop", String(err.message || err));
    app.quit();
    return;
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  stopLocalBackend();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  stopLocalBackend();
});
