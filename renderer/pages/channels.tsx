import React, { useContext, useEffect } from "react";
import { ChannelItem, ChannelSearchItem } from "../components/shared/channelItem/channelItem";
import { AppContext } from "../contexts/appContext";
import { authContext } from "../contexts/authContext";
import { ChannelMain, ModChannels } from "../styles/channels.styles";
import firebaseClient from "../firebase/client";
import { ChannelModel } from "../models/channel.model";
import Reorder, {
	reorder,
	reorderImmutable,
	reorderFromTo,
	reorderFromToImmutable,
} from "react-reorder";

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

	const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {
		console.log(previousIndex, nextIndex);
		setSavedChannels(prev => reorder(prev, previousIndex, nextIndex));
	};

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
			<Reorder
				reorderId="my-list" // Unique ID that is used internally to track this list (required)
				reorderGroup="reorder-group" // A group ID that allows items to be dragged between lists of the same group (optional)
				component={ModChannels} // Tag name or Component to be used for the wrapping element (optional), defaults to 'div'
				placeholderClassName="placeholder" // Class name to be applied to placeholder elements (optional), defaults to 'placeholder'
				draggedClassName="dragged" // Class name to be applied to dragged elements (optional), defaults to 'dragged'
				lock="horizontal" // Lock the dragging direction (optional): vertical, horizontal (do not use with groups)
				onReorder={onReorder} // Callback when an item is dropped (you will need this to update your state)
				autoScroll={true} // Enable auto-scrolling when the pointer is close to the edge of the Reorder component (optional), defaults to true
				disableContextMenus={true} // Disable context menus when holding on touch devices (optional), defaults to true
			>
				{savedChannels.map(channel => (
					<div key={channel.id} className="">
						<ChannelItem {...channel} passKey={channel.id} key={channel.id} />
					</div>
				))}
			</Reorder>
			<ChannelSearchItem />
		</ChannelMain>
	);
};

export default Channels;
