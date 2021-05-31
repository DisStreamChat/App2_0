import fs, { promises } from "fs";
import path from "path";
import { TabModel } from "../../models/tab.model";

export const appPath = () => {
	switch (process.platform) {
		case "darwin": {
			return path.join(process.env.HOME, "Library", "Application Support");
		}
		case "win32": {
			return process.env.APPDATA;
		}
		case "linux": {
			return process.env.HOME;
		}
	}
};

export enum FilePath {
	MESSAGES = "disstreamchat/messages",
	TABS = "disstreamchat/tabs"
}


export const getFileName = async (prefix: FilePath, channelName: string) => {
	const fullPath = path.join(prefix, `${channelName}.json`);
	const messagePath = path.join(appPath(), prefix);
	if (!fs.existsSync(messagePath)) {
		console.log("creating directory");
		await promises.mkdir(messagePath, { recursive: true });
		await promises.writeFile(fullPath, "");
	}
	return fullPath;
}

export const getMessageFileName = async (channelName: string) => {
	return getFileName(FilePath.MESSAGES, channelName)
};

export const getTabFileName = async (channelName: string) => {
	return getFileName(FilePath.TABS, channelName)

}

export const writeToFile = async (fileName, inData) => {
	const fullPath = path.join(appPath(), "\\", fileName);
	await promises.writeFile(fullPath, inData);
};

export const getMessages = async (channelName: string) => {
	const messagePath = path.join(appPath(), "\\", await getMessageFileName(channelName));
	if (!fs.existsSync(messagePath)) return [];
	const messages = await promises.readFile(messagePath, "utf-8");
	return JSON.parse(messages || "[]");
};

export const writeMessages = async (channelName: string, messages: any[]) => {
	writeToFile(await getMessageFileName(channelName), JSON.stringify(messages));
};

export const writeTabs = async (channelName: string, tabs: TabModel[]) => {
	writeToFile(await getMessageFileName(channelName), JSON.stringify(messages));
};
