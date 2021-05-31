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
import { useSocketContext } from "../../contexts/socketContext";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { EmptyButton } from "../../components/shared/ui-components/Buttons";
import { AnimatePresence } from "framer-motion";
import CloseIcon from "@material-ui/icons/Close";

const ChatMain = styled(Main)`
	flex-direction: column;
`;

const ChatContainer = styled.div`
	height: calc(100vh - 95px - 28px);
	overflow-x: hidden;
	::-webkit-scrollbar {
		width: 0.25rem;
		border-radius: 100px;
	}
	margin-right: 0.15rem;
`;

const Chat = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const { socket } = useSocketContext();
	const [messages, setMessages] = useState<MessageModel[]>([]);
	const [channel, setChannel] = useState<any>();
	const { tabChannels, savedChannels, setTabChannels, tabsOpen, setTabsOpen } = useContext(AppContext);

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
				if (doc.exists) {
					const data = doc.data();
					const { guildId, liveChatId, TwitchName: twitchName } = data;
					setChannel({ guildId, liveChatId, twitchName });
				} else {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_SOCKET_URL}/v2/twitch/exists?channel=${id}`
					);
					const json = await response.json();
					console.log(json);
					const { data } = json;
					setChannel({ twitchName: data.login });
				}
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
				<AnimatePresence>
					{
						<TabContainer exit={{ height: 0 }}>
							{tabChannels.map(channel => (
								<Tab className={`${id === channel.id ? "active" : ""}`}>
									<Link href={`/chat/${channel.id}`}>
										<a>{channel.name}</a>
									</Link>
									<CloseIcon
										onClick={() => {
											setTabChannels(prev => prev.filter(c => c.id !== channel.id));
										}}
									/>
								</Tab>
							))}
							{/* <EmptyButton>
								<KeyboardArrowDownIcon></KeyboardArrowDownIcon>
							</EmptyButton> */}
						</TabContainer>
					}
				</AnimatePresence>
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
