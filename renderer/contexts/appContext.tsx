import { ipcRenderer } from "electron";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ChannelModel } from "../models/channel.model";
import { authContext } from "./authContext";

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
	console.log(uid)
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
