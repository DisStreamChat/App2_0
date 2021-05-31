import fs, { promises } from "fs";
import path from "path";

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

export const MESSAGES_FILE_PATH = "disstreamchat/messages/";

export const getMessageFileName = async (channelName: string) => {
	const fullPath = path.join(MESSAGES_FILE_PATH, `${channelName}.json`);
	const messagePath = path.join(appPath(), MESSAGES_FILE_PATH);
	if (!fs.existsSync(messagePath)) {
		console.log("creating directory");
		await promises.mkdir(messagePath, { recursive: true });
		await promises.writeFile(fullPath, "");
	}
	return fullPath;
};

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
