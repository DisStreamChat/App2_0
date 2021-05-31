import { ipcRenderer } from "electron";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ChannelModel } from "../models/channel.model";
import { authContext } from "./authContext";
import firebaseClient from "../firebase/client"

export interface AppContextModel {
	savedChannels: ChannelModel[];
	setSavedChannels: React.Dispatch<React.SetStateAction<ChannelModel[]>>;
	tabChannels: ChannelModel[];
	setTabChannels: React.Dispatch<React.SetStateAction<ChannelModel[]>>;
	tabsOpen: boolean;
	setTabsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextModel>(null);

export const AppContextProvider = props => {
	const [savedChannels, setSavedChannels] = useState<ChannelModel[]>([]);
	const [tabChannels, setTabChannels] = useState<ChannelModel[]>([]);
	const [tabsOpen, setTabsOpen] = useState(false);

	const { user } = useContext(authContext);
	const uid = user?.uid;

	useEffect(() => {
		(async () => {
			if (!user) return;
			const docRef = firebaseClient.db.collection("Streamers").doc(user.uid);
			const doc = await docRef.get();
			const data = doc.data();
			const { ModChannels } = data;
			const channels: ChannelModel[] = (ModChannels as any[]).map((channel, i) => ({
				name: channel.display_name,
				avatar: channel.profile_image_url,
				id: channel.id,
				order: channel.order || i - 1,
				...channel,
			}));
			setSavedChannels(channels.sort((a, b) => a.order - b.order));
		})();
	}, [user]);

	useEffect(() => {
		if (uid) {
			ipcRenderer.once("sendTabs", (event, tabs: ChannelModel[]) => {
				setTabChannels(tabs);
			});
			ipcRenderer.send("getTabs", uid);
		}
	}, [uid]);

	return (
		<AppContext.Provider
			value={{
				savedChannels,
				setSavedChannels,
				tabChannels,
				setTabChannels,
				tabsOpen,
				setTabsOpen,
			}}
		>
			{props.children}
		</AppContext.Provider>
	);
};
