import { app as n, BrowserWindow as a, Menu as m, ipcMain as i } from "electron";
import o from "path";
import { fileURLToPath as s } from "url";
const d = s(import.meta.url), t = o.dirname(d);
let e = null;
const l = o.join(t, "../dist-electron/preload.mjs");
function r() {
  e = new a({
    width: 1e3,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    fullscreen: !1,
    frame: !1,
    backgroundColor: "#202020",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: l,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), m.setApplicationMenu(null), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(o.join(t, "../dist/index.html")), e?.webContents.openDevTools(), i.on("window:minimize", () => e?.minimize()), i.on("window:maximize", () => {
    e && (e.isMaximized() ? e.unmaximize() : e.maximize(), e.webContents.send("window:maximized", e.isMaximized()));
  }), i.on("window:close", () => e?.close()), e.on("maximize", () => e?.webContents.send("window:maximized", !0)), e.on("unmaximize", () => e?.webContents.send("window:maximized", !1));
}
n.whenReady().then(r);
n.on("window-all-closed", () => {
  process.platform !== "darwin" && n.quit();
});
