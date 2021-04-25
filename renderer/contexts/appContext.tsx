import React, { createContext, useState } from "react";
import { ChannelModel } from "../models/channel.model";

export interface AppContextModel {
	savedChannels: ChannelModel[],
	setSavedChannels: React.Dispatch<React.SetStateAction<ChannelModel[]>>
}

export const AppContext = createContext<AppContextModel>(null);

export const AppContextProvider = props => {
	const [savedChannels, setSavedChannels] = useState<ChannelModel[]>([])

	return <AppContext.Provider value={{
		savedChannels,
		setSavedChannels
	}}>{props.children}</AppContext.Provider>;
};
