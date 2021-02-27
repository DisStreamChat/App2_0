import { globalShortcut, BrowserWindow } from "electron";

interface hotkeys {
	[key: string]: () => void;
}

class HotKeyManager {
	hotkeys: hotkeys;
	private _unfocusOpacity: number;
	focusKey: string;
	unfocusKey: string

	constructor() {
		this.hotkeys = {};
		this.unfocusOpacity = .5;
		this.focusKey = "f6"
		this.unfocusKey = "f7";
	}

	get unfocusOpacity(){
		return this._unfocusOpacity || .5;
	}

	set unfocusOpacity(val: number){
		this._unfocusOpacity = val
	}

	register(key: string, callback: () => void) {
		if (this.hotkeys[key]) {
			globalShortcut.unregister(key);
		}
		this.hotkeys[key] = callback;
		globalShortcut.register(key, callback);
	}

	unregister(keys: string | string[]) {
		if (Array.isArray(keys)) {
			keys.forEach(this.unregister);
		} else {
			try {
				globalShortcut.unregister(keys);
				delete this.hotkeys[keys];
			} catch (err) {
				console.log(err.message);
			}
		}
	}

	unregisterAll() {
		globalShortcut.unregisterAll();
		this.hotkeys = {}
	}

	unfocusCallback() {
		const windows = BrowserWindow.getAllWindows();
		for(const window of windows){
			window.setOpacity(this.unfocusOpacity)
			window.setIgnoreMouseEvents(true)
			window.emit("blur")
		}
	}

	focusCallback() {
		const windows = BrowserWindow.getAllWindows();
		for(const window of windows){
			window.setOpacity(1)
			window.setIgnoreMouseEvents(false)
			window.emit("focus")
		}
	}
}


export default new HotKeyManager();
