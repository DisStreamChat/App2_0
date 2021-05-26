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
import styled from "styled-components";
import { TabContainer, Tab } from "../../styles/chat.style";
import { ipcRenderer } from "electron";

const ChatMain = styled(Main)`
	flex-direction: column;
`;

const ChatContainer = styled.div`
	height: calc(100vh - 95px - 28px);
	overflow-x: hidden;
	::-webkit-scrollbar {
		width: .25rem;
		border-radius: 100px;
	}
	margin-right: .15rem;
`;

const Chat = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const socket = useSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
		reconnect: true,
		transports: ["websocket"],
	});
	const [messages, setMessages] = useState<MessageModel[]>([]);
	const [channel, setChannel] = useState<any>();
	const { tabChannels, savedChannels } = useContext(AppContext);

	useSocketEvent(socket, "connect", () => {
		if (channel) {
			socket.emit("add", channel);
		}
	});

	useEffect(() => {
		return () => {
			setMessages([]);
		};
	}, [id]);

	useEffect(() => {
		(async () => {
			try {
				if (!id) return;
				const firebaseId = sha1(id);
				const docRef = firebaseClient.db.collection("Streamers").doc(firebaseId);
				const doc = await docRef.get();
				const data = doc.data();
				const { guildId, liveChatId, TwitchName: twitchName } = data;
				setChannel({ guildId, liveChatId, twitchName });
			} catch (err) {
				console.log(err.message);
			}
		})();
	}, [id]);

	useEffect(() => {
		if (channel) {
			ipcRenderer.on("sendMessages", (event, messages) => {
				setMessages(messages);
			});
			ipcRenderer.send("getMessages", channel.twitchName);
		}
		return () => {
			ipcRenderer.removeAllListeners("sendMessages");
		};
	}, [channel]);

	useEffect(() => {
		console.log({ channel });
		if (channel) {
			if (socket) {
				socket.emit("add", channel);
			}
		}
	}, [channel, socket]);

	useSocketEvent(socket, "chatmessage", msg => {
		console.log(msg);
		const transformedMessage = {
			content: msg.body,
			id: msg.id,
			platform: msg.platform,
			sender: {
				name: msg.displayName,
				avatar: msg.avatar,
				badges: msg.badges,
				color: msg.userColor,
			},
		};
		ipcRenderer.send("writeMessage", channel.twitchName, transformedMessage);
		setMessages(prev => [...prev, transformedMessage]);
	});

	return (
		<>
			<ChatMain>
				<TabContainer>
					{tabChannels.map(channel => (
						<Tab className={`${id === channel.id ? "active" : ""}`}>
							<Link href={`/chat/${channel.id}`}>
								<a>{channel.name}</a>
							</Link>
						</Tab>
					))}
				</TabContainer>
				<ChatContainer>
					<MessageList>
						{messages.map(msg => (
							<Message {...msg}></Message>
						))}
					</MessageList>
				</ChatContainer>
			</ChatMain>
		</>
	);
};

export default Chat;
