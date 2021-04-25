import firebaseClient from "../../../firebase/client";
import React, { useState, useContext, useEffect, useCallback } from "react";
import { SearchBox } from "disstreamchat-utils";
import Link from "next/link";
import { ChannelModel } from "../../../models/channel.model";
import { authContext } from "../../../contexts/authContext";
import useInterval from "react-use/lib/useInterval";
import { ChannelInfo, ChannelItemBody, ChannelProfilePicture } from "./channelItem.style";
import { OrangeButton, PurpleButton, RedButton, TwitchButton } from "../../../styles/button.styles";

export const ChannelItem = React.memo((props: ChannelModel) => {
	const [channelName, setChannelName] = useState(props.name);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [isLive, setIsLive] = useState(false);
	const { user } = useContext(authContext);

	const getLive = useCallback(async () => {
		if (channelName) {
			const ApiUrl = `${
				process.env.NEXT_PUBLIC_SOCKET_URL
			}/stats/twitch/?name=${channelName?.toLowerCase?.()}&new=true`;
			const response = await fetch(ApiUrl);
			const data = await response.json();
			setIsLive(() => !!(data?.isLive && channelName));
		}
	}, [channelName, props]);

	useEffect(() => {
		getLive();
	}, []);

	const removeChannel = useCallback(async () => {
		const userRef = firebaseClient.db.collection("Streamers").doc(user.uid);
		const modChannels = user.savedChannels;
		const newModChannels = modChannels.filter(channel => channel.id !== props.id);
		await userRef.update({
			ModChannels: newModChannels,
			removedChannels: firebaseClient.append(props.id),
		});
	}, [user, props, user]);

	const pinChannel = useCallback(async () => {
		const userRef = firebaseClient.db.collection("Streamers").doc(user.uid);
		await userRef.update({
			pinnedChannels: firebaseClient.append(props.id),
		});
	}, [user, props]);

	const unpinChannel = useCallback(async () => {
		const userRef = firebaseClient.db.collection("Streamers").doc(user.uid);
		await userRef.update({
			pinnedChannels: firebaseClient.remove(props.id),
		});
	}, []);

	useInterval(getLive, 60000 * 4);

	const addChannel = useCallback(
		async e => {
			e.preventDefault();
			setError("");
			try {
				setLoading(true);
				if (!channelName) {
					setError("Missing Channel Name");
				} else {
					const userName = user.name;
					const apiUrl = `${process.env.REACT_APP_SOCKET_URL}/resolveuser?user=${channelName}&platform=twitch`;
					const res = await fetch(apiUrl);
					if (!res.ok) {
						setError(
							`An error occured while fetching ${channelName}, make sure you entered the name correctly`
						);
					} else {
						const json = await res.json();
						if (json) {
							const ModChannels = [...user.ModChannels, json].filter(
								(thing, index, self) =>
									index === self.findIndex(t => t.id === thing.id)
							);
							await firebaseClient.db.collection("Streamers").doc(user.uid).update({
								ModChannels,
							});
						} else {
							setError("You are not a moderator for " + channelName);
						}
					}
				}
			} catch (err) {
				setError(
					`An error occured while fetching ${channelName}, make sure you entered the name correctly`
				);
			}
			setChannelName("");
			setLoading(false);
		},
		[channelName, user?.uid, user]
	);

	return (
		<ChannelItemBody>
			<>
				<ChannelProfilePicture live={isLive}>
					<img src={props["profile_image_url"] || props.avatar} alt="" />
				</ChannelProfilePicture>
				<ChannelInfo>
					<span className="channel-name">{channelName}</span>
					<Link href={`/chat/${props.id}`}>
						<a className="dashboard-link">
							<OrangeButton className="to-dashboard dashboard-button">
								Go To Chat
							</OrangeButton>
						</a>
					</Link>
					<Link href={`/chat/${props.id}`}>
						<a className="dashboard-link">
							<OrangeButton className="to-dashboard dashboard-button">
								Go To Chat
							</OrangeButton>
						</a>
					</Link>
					<Link href={`/chat/${props.id}`}>
						<a className="dashboard-link">
							<RedButton className="to-dashboard dashboard-button">
								Go To Chat
							</RedButton>
						</a>
					</Link>
				</ChannelInfo>
			</>
		</ChannelItemBody>
	);
});
