import React, { useContext } from "react";
import Reorder, { reorder } from "react-reorder";
import { useTitle } from "../hooks/useTitle";

import { ChannelItem, ChannelSearchItem } from "../components/shared/channelItem/channelItem";
import { AppContext } from "../contexts/appContext";
import { authContext } from "../contexts/authContext";
import firebaseClient from "../firebase/client";
import { ChannelMain, ModChannels } from "../styles/channels.styles";

const Channels = () => {
	const { savedChannels, setSavedChannels, setTabChannels, appActive } = useContext(AppContext);
	const { user } = useContext(authContext);

	useTitle("channels");

	const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {
		setSavedChannels(prev => {
			prev[previousIndex].order = nextIndex;
			prev[nextIndex].order = previousIndex;
			const newList = reorder(prev, previousIndex, nextIndex).filter(doc => doc.id);
			firebaseClient.db.collection("Streamers").doc(user.uid).update({ ModChannels: newList });
			return newList;
		});
	};

	return (
		<ChannelMain className={`${appActive ? "active" : ""}`} animate={{ y: appActive ? 0 : -65 }}>
			<h1>Your Channel</h1>
			<ChannelItem
				id="514845764"
				name="dav1dsnyder404"
				avatar="https://static-cdn.jtvnw.net/jtv_user_pictures/b308a27a-1b9f-413a-b22b-3c9b2815a81a-profile_image-300x300.png"
				isOwned
			></ChannelItem>
			<hr></hr>
			<h1>Saved Channels</h1>
			<Reorder
				reorderId="my-list"
				reorderGroup="reorder-group"
				component={ModChannels}
				placeholderClassName="placeholder"
				draggedClassName="dragged"
				lock="horizontal"
				onReorder={onReorder}
				autoScroll={true}
				disableContextMenus={true}
				holdTime={200}
			>
				{savedChannels.map(channel => (
					<div style={{ width: "95%" }} key={channel.id} className="">
						<ChannelItem large {...channel} passKey={channel.id} key={channel.id} />
					</div>
				))}
			</Reorder>
			<ChannelSearchItem />
		</ChannelMain>
	);
};

export default Channels;
