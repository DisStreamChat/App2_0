export const sendMessageToWindow = (event: string, message: any, window: Electron.BrowserWindow) => {
	if (window && window.webContents) {
		window.webContents.send(event, message);
	}
};