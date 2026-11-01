const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("benroDesktop", {
  platform: process.platform,
  isDesktop: true,
  mode: "offline-local",
});
