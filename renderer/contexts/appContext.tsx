import React, { createContext, useState } from "react";
import { ChannelModel } from "../models/channel.model";

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
