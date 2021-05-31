import firebaseClient from "../../../firebase/client";
import React, { useState, useContext, useEffect, useCallback, forwardRef } from "react";
import { SearchBox } from "disstreamchat-utils";
import Link from "next/link";
import { ChannelModel } from "../../../models/channel.model";
import { authContext } from "../../../contexts/authContext";
import useInterval from "react-use/lib/useInterval";
import {
	ChannelButtons,
	ChannelInfo,
	ChannelItemBody,
	ChannelProfilePicture,
	ChannelSearchBody,
	ChannelSearchSection,
} from "./channelItem.style";
import { OrangeButton, RedButton } from "../../../styles/button.styles";
import { AppContext } from "../../../contexts/appContext";
import { useMediaQuery } from "@material-ui/core";
import { useRouter } from "next/router";
interface ChannelProps extends Omit<ChannelModel, "order"> {
	isOwned?: boolean;
	passKey?: any;
	large?: boolean;
}

export const ChannelSearchItem = React.memo(() => {
	const [search, setSearch] = useState("");
	const { setSavedChannels } = useContext(AppContext);
	const { user } = useContext(authContext);
	const router = useRouter();

	const resetSearch = () => setSearch("");

	const submit = async e => {
		e.preventDefault();
		console.log(search);
		const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/v2/twitch/exists?channel=${search}`);
		const json = await response.json();
		if (json.exists) {
			const { data } = json;
			const { profile_image_url, display_name, id } = data;
			setSavedChannels(prev => {
				if (prev.find(channel => channel.id === id)) return prev;
				const newList = [...prev, { name: display_name, avatar: profile_image_url, id, order: Infinity }];
				firebaseClient.db.collection("Streamers").doc(user.uid).update({ ModChannels: newList });
				return newList;
			});
		}
		resetSearch();
	};

	return (
		<ChannelSearchBody>
			<h2>Add Channel</h2>
			<ChannelSearchSection onSubmit={submit}>
				<SearchBox
					placeholder="Enter Channel Name"
					search={search}
					onChange={setSearch}
					resetSearch={resetSearch}
				/>
				<OrangeButton>Submit</OrangeButton>
			</ChannelSearchSection>
		</ChannelSearchBody>
	);
});

export const ChannelItem = forwardRef((props: ChannelProps, ref: any) => {
	const [channelName, setChannelName] = useState(props.name);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [isLive, setIsLive] = useState(false);
	const { user } = useContext(authContext);
	const { setSavedChannels } = useContext(AppContext);

	const isSmall = useMediaQuery("(max-width: 750px)");

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
		setSavedChannels(prev => {
			const modChannels = prev;
			const newModChannels = modChannels.filter(channel => channel.id !== props.id);
			userRef.update({
				ModChannels: newModChannels,
				removedChannels: firebaseClient.append(props.id),
			});
			return newModChannels;
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
								(thing, index, self) => index === self.findIndex(t => t.id === thing.id)
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
				setError(`An error occured while fetching ${channelName}, make sure you entered the name correctly`);
			}
			setChannelName("");
			setLoading(false);
		},
		[channelName, user?.uid, user]
	);

	return (
		<ChannelItemBody style={props.large ? { width: "100%" } : {}} ref={ref} key={props.passKey}>
			<ChannelProfilePicture live={isLive}>
				<img src={props["profile_image_url"] || props.avatar} alt="" />
			</ChannelProfilePicture>
			<ChannelInfo>
				<span className="channel-name">{channelName}</span>
				<ChannelButtons>
					<Link href={`/chat/${props.id}`}>
						<a className="dashboard-link">
							<OrangeButton className="to-dashboard dashboard-button">Go To Chat</OrangeButton>
						</a>
					</Link>
					{!isSmall && (
						<Link href={`/chat/${props.id}`}>
							<a className="dashboard-link">
								<OrangeButton className="to-dashboard dashboard-button">Open in Popout</OrangeButton>
							</a>
						</Link>
					)}
					{!props.isOwned && (
						<RedButton onClick={removeChannel} className="to-dashboard dashboard-button">
							Remove
						</RedButton>
					)}
				</ChannelButtons>
			</ChannelInfo>
		</ChannelItemBody>
	);
});
