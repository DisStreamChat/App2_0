import { app, globalShortcut } from "electron";
import serve from "electron-serve";
import { baseUrl, createWindow } from "./helpers";
import { ipcMain } from "electron";
import hotKeyManager from "./helpers/hotkeys"
const isProd: boolean = process.env.NODE_ENV === "production";

const focus = () => hotKeyManager.focusCallback()
const unfocus = () => hotKeyManager.unfocusCallback() 

const resetHotkeys = () => {
	hotKeyManager.register(hotKeyManager.unfocusKey, unfocus)
	hotKeyManager.register(hotKeyManager.focusKey, focus)
}

if (isProd) {
	serve({ directory: "app" });
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`);
}


(async () => {
	await app.whenReady();
	const mainWindow = createWindow("main", {
		width: 1000,
		height: 600,
		alwaysOnTop: true,
		fullscreenable: false,
	});

	ipcMain.on("login-data", (event, token) => {
		if (mainWindow) {
			mainWindow.webContents.send("log-me-in", token);
		}
	}); 

	mainWindow.loadURL(baseUrl("auth"));

	resetHotkeys()
})();

let settingsWindow: Electron.BrowserWindow | null = null;
ipcMain.on("open-settings", (event, arg) => {
	if (settingsWindow) {
		if (settingsWindow.isMinimized()) settingsWindow.restore();
		settingsWindow.focus();
		return;
	}
	settingsWindow = createWindow("settings", {
		width: 500,
		height: 500,
		transparent: false,
		backgroundColor: "#2a2c30",
	});

	settingsWindow.loadURL(baseUrl("settings"));
	settingsWindow.on("close", () => (settingsWindow = null));
});



ipcMain.on("clear-hotkeys", () => {
	hotKeyManager.unregisterAll()
});

ipcMain.on("reset-hotkeys", () => {
	resetHotkeys();
})



app.on("window-all-closed", () => {
	app.quit();
});
