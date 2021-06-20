import { ipcRenderer } from "electron";
import { ChannelModel } from "../models/channel.model";
import { MessageModel } from "../models/message.model";

enum FileType {
	MESSAGES = "Messages",
	TABS = "Tabs",
}

export const fetchFromFile = <T>(type: FileType, uid: string): Promise<T[]> => {
	ipcRenderer.send(`get${type}`, uid);

	return new Promise(resolve => {
		ipcRenderer.once(`get${type}`, (event, values: T[]) => {
			resolve(values);
		});
	});
};

export const fetchTabs = (uid: string): Promise<ChannelModel[]> => {
	return fetchFromFile(FileType.TABS, uid);
};

export const fetchMessages = (uid: string): Promise<MessageModel[]> => {
	return fetchFromFile(FileType.MESSAGES, uid);
};
