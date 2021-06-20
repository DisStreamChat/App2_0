import React, { useContext } from "react";
import { AppContext } from "../contexts/appContext";
import { ChannelModel } from "../models/channel.model";
import CloseIcon from "@material-ui/icons/Close";
import { Tab } from "../styles/chat.style";
import Link from "next/link";
import { useStats } from "../hooks/useStats";
import { LiveIndicator } from "./shared/ui-components/LiveIndicator";
import { useSocketContext } from "../contexts/socketContext";

export interface TabItemProps extends ChannelModel {
	userId: string;
}

const RawTabItem = ({ name, id, userId }: TabItemProps) => {
	const { setTabChannels, channelsWithHighlights } = useContext(AppContext);
	const { socket } = useSocketContext();
	const stats = useStats(name);

	return (
		<Tab
			key={id}
			className={`${userId === id ? "active" : ""}`}
			hasUnreadMessages={false}
			hasHighlightMatches={channelsWithHighlights.has(name?.toLowerCase?.())}
		>
			<LiveIndicator live={stats?.isLive} />
			<Link href={`/chat/${id}`}>
				<a>{name}</a>
			</Link>
			<CloseIcon
				style={{ cursor: "pointer" }}
				onClick={() => {
					setTabChannels(prev => prev.filter(c => c.id !== id));
					socket.emit("remove", { twitchName: name });
				}}
			/>
		</Tab>
	);
};

export const TabItem = React.memo(RawTabItem);
