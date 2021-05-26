import { app, ipcMain, shell } from "electron";
import serve from "electron-serve";
import { baseUrl, createWindow, isProd } from "./helpers";
import hotKeyManager from "./helpers/hotkeys";
import { appPath, getMessages, writeMessages } from "./helpers/message-saving";

const focus = () => hotKeyManager.focusCallback();
const unfocus = () => hotKeyManager.unfocusCallback();

const resetHotkeys = () => {
	hotKeyManager.register(hotKeyManager.unfocusKey, unfocus);
	hotKeyManager.register(hotKeyManager.focusKey, focus);
};

if (isProd) {
	serve({ directory: "app" });
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const startMainWindow = () => {
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
};
let loadingWindow;
(async () => {
	await app.whenReady();

	app.on("web-contents-created", (e, contents) => {
		contents.on("will-navigate", (event, url) => {
			if (url.includes("localhost") || url.includes("https://id.twitch.tv/oauth2/authorize")) return;
			event.preventDefault();
			shell.openExternal(url);
			console.log("blocked navigate:", url);
		});
		contents.on("new-window", (event, url) => {
			if (url.includes("localhost")) return;
			event.preventDefault();
			shell.openExternal(url);
			console.log("blocked window:", url);
		});
	});

	loadingWindow = createWindow("loading", {
		width: 300,
		height: 300,
		maxHeight: 300,
		maxWidth: 300,
		minHeight: 300,
		minWidth: 300,
		alwaysOnTop: true,
		transparent: false,
		backgroundColor: "#2a2c30",
		// frame: false,
	});

	loadingWindow.loadURL(baseUrl("initial"));

	resetHotkeys();
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
	hotKeyManager.unregisterAll();
});

ipcMain.on("reset-hotkeys", () => {
	resetHotkeys();
});

ipcMain.on("getMessages", async (event, channelName) => {
	event.reply("sendMessages", await getMessages(channelName));
});

ipcMain.on("writeMessage", async (event, channelName, message) => {
	const oldMessages = await getMessages(channelName);
	await writeMessages(channelName, [...oldMessages, message]);
});

ipcMain.once("app-ready", () => {
	startMainWindow();
	setTimeout(() => {
		loadingWindow.close();
	}, 500);
});

app.on("window-all-closed", () => {
	app.quit();
});
