import { SearchBox } from "disstreamchat-utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { forwardRef, useCallback, useContext, useState } from "react";

import { useMediaQuery } from "@material-ui/core";

import { AppContext } from "../../../contexts/appContext";
import { authContext } from "../../../contexts/authContext";
import firebaseClient from "../../../firebase/client";
import { useStats } from "../../../hooks/useStats";
import { ChannelModel } from "../../../models/channel.model";
import { OrangeButton, RedButton } from "../../../styles/button.styles";
import {
	ChannelButtons,
	ChannelInfo,
	ChannelItemBody,
	ChannelProfilePicture,
	ChannelSearchBody,
	ChannelSearchSection,
} from "./channelItem.style";
import { LiveIndicator } from "../ui-components/LiveIndicator";

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
	const { user } = useContext(authContext);
	const { setSavedChannels, settings } = useContext(AppContext);

	const isSmall = useMediaQuery("(max-width: 750px)");

	const stats = useStats(props.name);

	const compactChannels = settings?.CompactChannels;

	console.log(compactChannels);

	const { isLive } = stats || { isLive: false };

	const removeChannel = useCallback(async () => {
		const userRef = firebaseClient.db.collection("Streamers").doc(user.uid);
		setSavedChannels(prev => {
			const modChannels = prev;
			const newModChannels = modChannels.filter(channel => channel.id !== props.id).filter(doc => doc.id);
			userRef.update({
				ModChannels: newModChannels.filter(doc => doc.id),
				removedChannels: firebaseClient.append(props.id),
			});
			return newModChannels;
		});
	}, [user, props, user]);

	return (
		<ChannelItemBody
			className={`${compactChannels ? "compact" : ""}`}
			style={props.large ? { width: "100%" } : {}}
			ref={ref}
			key={props.passKey}
		>
			{!compactChannels ? (
				<ChannelProfilePicture live={isLive}>
					<img src={props["profile_image_url"] || props.avatar} alt="" />
				</ChannelProfilePicture>
			) : (
				<LiveIndicator live={isLive} />
			)}
			<ChannelInfo>
				<span className="channel-name">{channelName}</span>
				<ChannelButtons>
					<Link href={`/chat/${props.id}`}>
						<a className={`dashboard-link ${compactChannels ? "compact" : ""}`}>
							<OrangeButton className={`${compactChannels ? "compact" : ""}`}>Go To Chat</OrangeButton>
						</a>
					</Link>
					{!isSmall && !compactChannels && (
						<Link href={`/chat/${props.id}`}>
							<a className={`dashboard-link ${compactChannels ? "compact" : ""}`}>
								<OrangeButton className={`${compactChannels ? "compact" : ""}`}>
									Open in Popout
								</OrangeButton>
							</a>
						</Link>
					)}
					{!props.isOwned && (
						<RedButton onClick={removeChannel} className={`${compactChannels ? "compact" : ""}`}>
							Remove
						</RedButton>
					)}
				</ChannelButtons>
			</ChannelInfo>
		</ChannelItemBody>
	);
});
