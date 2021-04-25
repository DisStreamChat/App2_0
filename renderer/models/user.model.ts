import { ChannelModel } from "./channel.model";
import firebase from "firebase"

export interface userModel extends firebase.User, firebase.firestore.DocumentData {
	appSettings: any;
	displayName: string;
	liveChatId: string[];
	pinnedChannels: ChannelModel[] | string[];
	savedChannels: ChannelModel[];
	profilePicture: string;
	removedChannels: string[] | ChannelModel[];
	uid: string;
	twitchId: string;
}
