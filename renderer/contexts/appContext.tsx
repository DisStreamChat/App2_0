import { ipcRenderer } from "electron";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChannelModel } from "../models/channel.model";
import { authContext } from "./authContext";
import firebaseClient from "../firebase/client";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { SettingsDocument, Settings } from "../models/settings.model";
import { apiFetch } from "../functions/fetching";
import { useInteraction } from "../hooks/useInteraction";
import { Titlebar } from "custom-electron-titlebar/titlebar";
import { Filter } from "../models/filter.model";

interface TwitchDetails {
	login: string;
	id: string;
}

export interface AppContextModel {
	savedChannels: ChannelModel[];
	setSavedChannels: React.Dispatch<React.SetStateAction<ChannelModel[]>>;
	tabChannels: ChannelModel[];
	setTabChannels: React.Dispatch<React.SetStateAction<ChannelModel[]>>;
	tabsOpen: boolean;
	setTabsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	settings: Settings;
	twitchDetails: TwitchDetails;
	setTwitchDetails: React.Dispatch<React.SetStateAction<TwitchDetails>>;
	appHovered: boolean;
	appActive: boolean;
	windowFocused: boolean;
	setWindowFocused: React.Dispatch<React.SetStateAction<boolean>>;
	active: boolean;
	titleBarRef: React.MutableRefObject<Titlebar>;
	filters: { [key: string]: Filter };
}

export const AppContext = createContext<AppContextModel>(null);

export const AppContextProvider = props => {
	const [savedChannels, setSavedChannels] = useState<ChannelModel[]>([]);
	const [tabChannels, setTabChannels] = useState<ChannelModel[]>([]);
	const [tabsOpen, setTabsOpen] = useState(false);
	const { user } = useContext(authContext);
	const [twitchDetails, setTwitchDetails] = useState<TwitchDetails>(null);
	let doc = typeof window === "undefined" ? {} : (document as any);
	const [appHovered] = useInteraction({ current: doc?.body } as any);
	const [windowFocused, setWindowFocused] = useState(false);
	const titleBarRef = useRef<Titlebar>();

	const uid = user?.uid;
	const twitchId = user?.twitchId;
	const [{ appSettings: settings, filters } = { appSettings: {}, filters: {} }] = useDocumentData<SettingsDocument>(
		firebaseClient.db.collection("Streamers").doc(uid || " ")
	);

	useEffect(() => {
		ipcRenderer.on("focus", (event, data) => setWindowFocused(data));
		ipcRenderer.on("focus-again", (event, data) => setWindowFocused(prev => prev && data));
		return () => {
			ipcRenderer.removeAllListeners("focus");
			ipcRenderer.removeAllListeners("focus-again");
		};
	}, []);

	useEffect(() => {
		(async () => {
			const details = await apiFetch(`v2/twitch/resolveuser?user=${twitchId}&platform=twitch`);
			setTwitchDetails(details);
		})();
	}, [twitchId]);

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
			setSavedChannels(channels.sort((a, b) => a.order - b.order).filter(doc => doc.id));
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
				filters,
				titleBarRef,
				windowFocused,
				setWindowFocused,
				active: appHovered || windowFocused,
				appActive: appHovered ? true : settings?.HideHeaderOnUnfocus ? windowFocused : true,
				appHovered,
				twitchDetails,
				setTwitchDetails,
				settings,
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
