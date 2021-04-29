import { ChannelModel } from "./channel.model";
import firebase from "firebase";

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

export interface TwitchUserModel {
	broadcaster_type?: string;
	created_at: string;
	description: string;
	display_name: string;
	email: string;
	id: string;
	login: string;
	offline_image_url: string;
	profile_image_url: string;
	type: string;
	view_count: number;
}
