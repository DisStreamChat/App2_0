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
import { AnimatePresence } from "framer-motion";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import { EmptyButton } from "../../components/shared/ui-components/Buttons";
import { ClickAwayListener } from "@material-ui/core";
import { authContext } from "../../contexts/authContext";

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

const ChannelList = styled.ul`
	z-index: 100;
	position: absolute;
	background: black;
	padding: 0.5rem !important;
	li {
		cursor: pointer;
	}
`;

class QueueBuffer {
	_queue: any[];
	_timeout: number;
	_timer: any;
	constructor(array = []) {
		// super();
		this._queue = array;
		this._timeout = 500;
		this._timer = null;
	}

	push(val) {
		this._queue.push(val);
	}

	set timeout(val) {
		this._timeout = val;
	}

	subscribe(callback) {
		// callback(this._queue.shift());
		this._timer = setInterval(() => {
			const value = this._queue.shift();
			if (value) {
				callback(value);
			}
		}, this._timeout);
	}

	unsubscribe() {
		clearInterval(this._timer);
	}
}

const buffer = new QueueBuffer();

const Chat = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const { socket } = useSocketContext();
	const [messages, setMessages] = useState<MessageModel[]>([]);
	const [channel, setChannel] = useState<any>();
	const { tabChannels, savedChannels, setTabChannels, tabsOpen, setTabsOpen } = useContext(AppContext);
	const [addingChannel, setAddingChannel] = useState(false);
	const { user } = useContext(authContext);

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
		buffer.push(msg);
	});

	useEffect(() => {
		if (channel) {
			buffer.subscribe(msg => {
				const transformedMessage = {
					content: msg.body,
					id: msg.id,
					platform: msg.platform,
					sender: {
						name: msg.displayName,
						avatar: msg.avatar,
						badges: msg.badges || {},
						color: msg.userColor,
					},
				};
				ipcRenderer.send("writeMessage", channel.twitchName, transformedMessage);
				setMessages(prev => [...prev, transformedMessage]);
			});
		}
		return () => {
			buffer.unsubscribe();
		};
	}, [channel]);

	return (
		<>
			<ChatMain>
				<AnimatePresence>
					{
						<TabContainer exit={{ height: 0 }}>
							{tabChannels.map(channel => (
								<Tab key={channel.id} className={`${id === channel.id ? "active" : ""}`}>
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
							<ClickAwayListener
								onClickAway={() => {
									setAddingChannel(false);
								}}
							>
								<div>
									<EmptyButton
										className="add-button"
										onClick={() => {
											setAddingChannel(true);
										}}
									>
										<AddIcon />
									</EmptyButton>
									{addingChannel && (
										<ChannelList>
											{savedChannels
												.filter(channel => !tabChannels.find(tab => channel.id === tab.id))
												.map(channel => (
													<li
														onClick={() => {
															setTabChannels(prev => {
																const newList = [...prev, channel];
																ipcRenderer.send("writeTabs", user.uid, newList);
																return newList;
															});
															setAddingChannel(false);
														}}
														key={channel.id}
													>
														{channel.name}
													</li>
												))}
										</ChannelList>
									)}
								</div>
							</ClickAwayListener>
						</TabContainer>
					}
				</AnimatePresence>
				<ChatContainer>
					<MessageList>
						{messages.map(msg => (
							<Message {...msg} key={msg.id}></Message>
						))}
					</MessageList>
				</ChatContainer>
			</ChatMain>
		</>
	);
};

export default Chat;
