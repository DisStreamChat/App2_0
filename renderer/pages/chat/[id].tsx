import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Main } from "../../styles/global.styles";
import useSocket from "../../hooks/useSocket";
import useSocketEvent from "../../hooks/useSocketEvent";
import { Message, MessageList } from "disstreamchat-utils";
import { MessageModel } from "../../models/message.model";
import sha1 from "sha1";
import firebaseClient from "../../firebase/client";
import { AppContext } from "../../contexts/appContext";
import Link from "next/link";
import styled from "styled-components"
import {Tab, TabContainer} from "../../styles/tabs.styles"
const ChatMain = styled(Main)`
	flex-direction: column;
`

const Chat = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const [socket] = useSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
		transports: ["websocket"],
		reconnect: true,
	});
	const [messages, setMessages] = useState<MessageModel[]>([]);
	const [channel, setChannel] = useState<any>();
	const { tabChannels, savedChannels } = useContext(AppContext);

	console.log({savedChannels, tabChannels})

	socket?.on?.("connection_error", console.log);

	useSocketEvent(socket, "imConnected", () => {
		if (channel) {
			socket.emit("addme", channel);
		}
	});

	useEffect(() => {
		(async () => {
			try {
				if (!id) return;
				const firebaseId = sha1(id);
				console.log(firebaseId);
				const docRef = firebaseClient.db.collection("Streamers").doc(firebaseId);
				const doc = await docRef.get();
				const data = doc.data();
				console.log(data);
				const { guildId, liveChatId, TwitchName } = data;
				setChannel({ guildId, liveChatId, TwitchName });
			} catch (err) {
				console.log(err.message);
			}
		})();
	}, [id]);

	useEffect(() => {
		if (channel) {
			// send info to backend with sockets, to get proper socket connection
			if (socket) {
				socket.emit("addme", channel);
			}
		}
	}, [channel, socket]);

	useSocketEvent(socket, "chatmessage", msg => {
		setMessages(prev => [
			...prev,
			{
				content: msg.body,
				id: msg.id,
				platform: msg.platform,
				sender: {
					name: msg.displayName,
					avatar: msg.avatar,
					badges: msg.badges,
					color: msg.userColor,
				},
			},
		]);
	});

	return (
		<ChatMain>
			<TabContainer>
				{tabChannels.map(channel => (
					<Tab>
						<Link href={`/chat/${channel.id}`}>
							<a>{channel.name}</a>
						</Link>
					</Tab>
				))}
			</TabContainer>
			<MessageList>
				{messages.map(msg => (
					<Message {...msg}></Message>
				))}
			</MessageList>
		</ChatMain>
	);
};

export default Chat;
