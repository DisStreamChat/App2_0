import { app } from "electron";
import serve from "electron-serve";
import { baseUrl, createWindow } from "./helpers";
import { ipcMain } from "electron";
const isProd: boolean = process.env.NODE_ENV === "production";

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
	});

	mainWindow.loadURL(baseUrl())
})();

ipcMain.on("open-settings", (event, arg) => {
	const settingsWindow = createWindow("settings", {
		width: 500,
		height: 500,
	})

	settingsWindow.loadURL(baseUrl("settings"))
});

app.on("window-all-closed", () => {
	app.quit();
});
