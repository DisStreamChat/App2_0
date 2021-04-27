import React, { useContext } from "react";
import { ChannelItem, ChannelSearchItem } from "../components/shared/channelItem/channelItem";
import { AppContext } from "../contexts/appContext";
import { ChannelMain, ModChannels } from "../styles/channels.styles";

const Channels = () => {
	const { savedChannels } = useContext(AppContext);
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
					<ChannelItem {...channel} />
				))}
			</ModChannels>
			<ChannelSearchItem/>
		</ChannelMain>
	);
};

export default Channels;
