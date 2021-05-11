import React, { useContext, useEffect } from "react";
import { ChannelItem, ChannelSearchItem } from "../components/shared/channelItem/channelItem";
import { AppContext } from "../contexts/appContext";
import { authContext } from "../contexts/authContext";
import { ChannelMain, ModChannels } from "../styles/channels.styles";
import firebaseClient from "../firebase/client";
import { ChannelModel } from "../models/channel.model";

const Channels = () => {
	const { savedChannels, setSavedChannels, setTabChannels } = useContext(AppContext);
	const { user } = useContext(authContext);

	useEffect(() => {
		(async () => {
			if (!user) return;
			const docRef = firebaseClient.db.collection("Streamers").doc(user.uid);
			const doc = await docRef.get();
			const data = await doc.data();
			const { ModChannels } = data;
			const channels: ChannelModel[] = ModChannels.map(channel => ({
				name: channel.display_name,
				avatar: channel.profile_image_url,
				id: channel.id,
			}));
			console.log(channels);
			setSavedChannels(channels);
			setTabChannels(
				channels.filter(channel =>
					["cozycoding", "Kitboga", "SaintPlaysThings", "CodingGarden"].includes(
						channel.name
					)
				)
			);
		})();
	}, [user]);

	return (
		<ChannelMain>
			<h1>Your Channel</h1>
			<ChannelItem
				id="514845764"
				name="dav1dsnyder404"
				avatar="https://static-cdn.jtvnw.net/jtv_user_pictures/b308a27a-1b9f-413a-b22b-3c9b2815a81a-profile_image-300x300.png"
				isOwned
			></ChannelItem>
			<hr></hr>
			<h1>Saved Channels</h1>
			<ModChannels>
				{savedChannels.map(channel => (
					<ChannelItem {...channel} key={channel.id} />
				))}
			</ModChannels>
			<ChannelSearchItem />
		</ChannelMain>
	);
};

export default Channels;
