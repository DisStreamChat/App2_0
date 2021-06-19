import React, { useContext } from "react";
import { AppContext } from "../contexts/appContext";
import { ChannelModel } from "../models/channel.model";
import CloseIcon from "@material-ui/icons/Close";
import { Tab } from "../styles/chat.style";
import Link from "next/link";
import { useStats } from "../hooks/useStats";
import { LiveIndicator } from "./shared/ui-components/LiveIndicator";
import { useSocketContext } from "../contexts/socketContext";

export interface TabItemProps {
	channel: ChannelModel;
	id: string;
}

export const TabItem = ({ channel, id }: TabItemProps) => {
	const { setTabChannels } = useContext(AppContext);
	const { socket } = useSocketContext();
	const { isLive } = useStats(channel.name);

	return (
		<Tab key={channel.id} className={`${id === channel.id ? "active" : ""}`} hasUnreadMessages={true} hasHighlightMatches={false}>
			<LiveIndicator live={isLive} />
			<Link href={`/chat/${channel.id}`}>
				<a>{channel.name}</a>
			</Link>
			<CloseIcon
				style={{ cursor: "pointer" }}
				onClick={() => {
					setTabChannels(prev => prev.filter(c => c.id !== channel.id));
					socket.emit("remove", { twitchName: channel.name });
				}}
			/>
		</Tab>
	);
};
