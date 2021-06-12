import { Message, MessageList, SearchBox } from "disstreamchat-utils";
import { ipcRenderer } from "electron";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useInterval } from "react-use";
import sha1 from "sha1";
import styled from "styled-components";
import useHotkeys from "use-hotkeys";

import { ClickAwayListener } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";

import { EmoteItem, UserItem } from "../../components/autoFillItem";
import { AppContext } from "../../contexts/appContext";
import { authContext } from "../../contexts/authContext";
import { useSocketContext } from "../../contexts/socketContext";
import firebaseClient from "../../firebase/client";
import handleFlags from "../../functions/flagFunctions";
import useSocketEvent from "../../hooks/useSocketEvent";
import { MessageModel } from "../../models/message.model";
import { ClearButton } from "../../styles/button.styles";
import { Tab, TabContainer } from "../../styles/chat.style";
import { Main } from "../../styles/global.styles";
import { SearchContainer } from "../settings";

const ChatMain = styled(Main)`
	flex-direction: column;
`;

const ChatContainer = styled.div`
	--tabHeight: 0px;
	height: calc(100vh - 30px - var(--tabHeight));
	&.active {
		transition: height 0.25s;
		height: calc(100vh - 30px - var(--tabHeight) - 40px);
	}
	&.tabs {
		--tabHeight: 56px;
	}
	overflow-x: hidden;
	&::-webkit-scrollbar {
		width: 0.25rem;
		border-radius: 100px;
	}
	&.no-scrollbar {
		&::-webkit-scrollbar {
			width: 0rem;
		}
	}
	margin-right: 0.15rem;
`;

const ChannelList = styled.ul`
	z-index: 100;
	overflow: auto;
	max-height: 200px;
	border-radius: 0.25rem;
	position: absolute;
	background: #121212;
	li {
		&:first-child {
			padding-top: 0.5rem !important;
		}
		&:last-child {
			padding-bottom: 0.5rem !important;
		}
		&:hover {
			background: #ffffff11;
		}
		padding: 0 0.5rem !important;
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

const ChatInputContainer = styled.div`
	.auto-complete-dropdown {
		max-height: 300px;
		overflow: auto;
	}
	& > img {
		margin: 0 1rem;
		width: 30px;
		transition: 0.025s;
		filter: grayscale(1);
		cursor: default;
		&:hover {
			filter: none;
		}
	}
	&:focus-within {
		box-shadow: 0 0 0 1px #137cbd, 0 0 0 1px #137cbd, 0 0 0 3px rgba(19, 124, 189, 0.3),
			inset 0 0 0 1px rgba(16, 22, 26, 0.3), inset 0 1px 1px rgba(16, 22, 26, 0.4);
	}
	cursor: text;
	z-index: 9;
	position: fixed;
	bottom: 15px;
	left: 50%;
	transform: translateX(-50%);
	width: 95%;
	height: 75px;
	background: #212121;
	border-radius: 0.5rem;
	color: white;
	// overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: space-between;

	#chat-input {
		width: 86%;
		font-family: Poppins;
		flex: 1;
		resize: none;
		outline: none;
		border: none;
		color: white;
		padding: 0.75rem;
		height: 75px;
		align-self: center;
		border-radius: 0.5rem;
		background: #212121;
		box-sizing: border-box !important;
		z-index: 10000;
		/* top: 0;
		position: absolute; */
		// min-height: fit-content;
		&::-webkit-scrollbar {
			width: 0px;
		}

		/* Track */
		&::-webkit-scrollbar-track {
			background: #f1f1f1;
		}

		/* Handle */
		&::-webkit-scrollbar-thumb {
			background: #888;
		}

		/* Handle on hover */
		&::-webkit-scrollbar-thumb:hover {
			background: #555;
		}
	}
`;

const Chat = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const { socket } = useSocketContext();
	const [messages, setMessages] = useState<MessageModel[]>([]);
	const [channel, setChannel] = useState<any>();
	const [addingChannel, setAddingChannel] = useState(false);
	const { tabChannels, savedChannels, setTabChannels, settings, appActive, active } = useContext(AppContext);
	const { user } = useContext(authContext);
	const [messageQuery, setMessageQuery] = useState("");
	const [isMod, setIsMod] = useState(false);
	const [showSearch, setShowSearch] = useState(true);
	const [chatValue, setChatValue] = useState("");
	const [showChatBox, setShowChatBox] = useState(true);
	const [allChatters, setAllChatters] = useState([]);
	const [userEmotes, setUserEmotes] = useState([]);
	const bodyRef = useRef<HTMLElement>();

	useEffect(() => {
		(async () => {
			console.log(user);
			const apiUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL}/emotes?user=${user?.TwitchName}`;
			const customApiUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL}/customemotes?channel=${channel?.twitchName}`;
			let [emotes, customEmotes] = await Promise.all([
				(async () => {
					const response = await fetch(apiUrl);
					return response.json();
				})(),
				(async () => {
					const response = await fetch(customApiUrl);
					return response.json();
				})(),
			]);

			emotes = emotes.emoticon_sets;
			if (emotes) {
				let allEmotes = [];
				for (let [key, value] of Object.entries(emotes) as [string, any]) {
					allEmotes = [...allEmotes, ...value.map(emote => ({ ...emote, channelId: key }))];
				}
				for (const [key, value] of Object.entries(customEmotes?.bttv?.bttvEmotes || {})) {
					allEmotes.push({ code: key, name: value, char: key, bttv: true });
				}
				for (const [key, value] of Object.entries(customEmotes?.ffz?.ffzEmotes || {})) {
					allEmotes.push({ code: key, name: value, char: key, ffz: true });
				}
				setUserEmotes(allEmotes);
			}
		})();
	}, [user, channel]);

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
		if (channel) {
			if (socket) {
				socket.emit("add", channel);
			}
		}
	}, [channel, socket]);

	useSocketEvent(socket, "chatmessage", msg => {
		buffer.push(msg);
	});

	const getChatters = async () => {
		if (!channel?.twitchName) return;
		const chatterUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL}/chatters?user=${channel?.twitchName}`;
		const response = await fetch(chatterUrl);
		const json = await response.json();
		if (json && response.ok) {
			const info = {};
			const chatters = [];
			for (let [key, value] of Object.entries(json.chatters) as [string, any]) {
				if (value.length === 0) continue;
				info[key] = await Promise.all(
					value.map(async name => {
						chatters.push(name);
						return { login: name, id: name };
					})
				);
			}
			setAllChatters(chatters);
		}
	};

	useEffect(() => {
		getChatters();
	}, [channel]);

	useInterval(getChatters, 120000 * 2);

	useEffect(() => {
		if (channel) {
			buffer.subscribe(msg => {
				console.log(msg);
				const transformedMessage = {
					content: msg.body,
					id: msg.id,
					platform: msg.platform,
					sentAt: msg.sentAt,
					type: msg.type,
					sender: {
						name: msg.displayName,
						avatar: msg.avatar,
						badges: msg.badges || {},
						color: msg.userColor,
					},
					streamer: channel.twitchName,
				};
				if (settings?.ReverseMessageOrder) {
					const shouldScroll = Math.abs(bodyRef.current.scrollTop - bodyRef.current.scrollHeight) < 1500;
					setTimeout(() => {
						if (shouldScroll) {
							bodyRef.current.scrollTo({
								top: bodyRef.current.scrollHeight,
								behavior: "smooth",
							});
						}
					}, 200);
				}

				ipcRenderer.send("writeMessage", channel.twitchName, transformedMessage);
				setMessages(prev => [...prev, transformedMessage]);
			});
		}
		return () => {
			buffer.unsubscribe();
		};
	}, [channel]);

	const flagMatches = useMemo(
		() => handleFlags(showSearch ? messageQuery : "", [...messages]),
		[messages, messageQuery, setMessageQuery, isMod, settings, active]
	);

	useHotkeys(
		(key, event, handle) => {
			switch (key) {
				case "ctrl+f":
					setMessageQuery("");
					setShowSearch(true);
					(document.querySelector(".settings--searchbox") as HTMLInputElement).focus();
					break;
				case "esc":
					setChatValue("");
					setShowChatBox(false);
					setShowSearch(false);
					setMessageQuery("");
					break;
				case "ctrl+shift+c":
					setChatValue("");
					setShowChatBox(true);
					break;
				default:
					break;
			}
		},
		["ctrl+f", "esc", "ctrl+shift+c"],
		[]
	);

	const sendMessage = () => {
		if (socket) {
			socket.emit("sendchat", {
				message: chatValue,
			});
		}
	};

	console.log(settings?.IgnoredCommandPrefixes);

	const displayedMessages = useMemo(
		() =>
			flagMatches
				.filter(msg => {
					const definedSettings = settings || {};
					if (definedSettings.IgnoreChannelPoints && msg.type === "channel-points") return false;
					if (definedSettings.IgnoreCheers && msg.type === "cheer") return false;
					if (definedSettings.IgnoreFollors && msg.type === "follow") return false;
					if (definedSettings.IgnoreSubscriptions && msg.type === "subscription") return false;
					if (definedSettings.IgnoredUsers?.find(user => user.value === msg.sender.name.toLowerCase()))
						return false;
					if (definedSettings.IgnoredCommandPrefixes?.find(prefix => msg.content.startsWith(prefix.value)))
						return false;
					return true;
				})
				.slice(-Math.max(settings?.MessageLimit, 100)),
		[flagMatches, settings]
	);

	return (
		<ChatMain style={{ fontFamily: settings?.Font }} animate={{ y: appActive ? 0 : -65 }}>
			<AnimatePresence>
				{settings.ShowTabs && (
					<TabContainer initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}>
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
								<ClearButton
									style={{ paddingBottom: "0rem", paddingTop: "0rem", marginTop: ".125rem" }}
									className="add-button"
									onClick={() => {
										setAddingChannel(true);
									}}
								>
									<AddIcon />
								</ClearButton>
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
				)}
			</AnimatePresence>
			<ChatContainer
				ref={bodyRef as any}
				style={{ fontFamily: settings?.Font }}
				className={`${appActive ? "active" : ""} ${settings?.ShowTabs ? "tabs" : ""} ${
					!settings?.ShowScrollbar ? "no-scrollbar" : ""
				}`}
			>
				<AnimatePresence>
					{showSearch && active && (
						<SearchContainer
							initial={{ opacity: 0, y: -100, height: 0 }}
							animate={{ opacity: 1, y: 0, height: "auto" }}
							exit={{ opacity: 0, y: -100, height: 0 }}
						>
							<SearchBox
								search={messageQuery}
								onChange={val => setMessageQuery(val)}
								resetSearch={() => setMessageQuery("")}
							></SearchBox>
						</SearchContainer>
					)}
				</AnimatePresence>
				<MessageList
					className={`${showChatBox && active ? "chat-box" : ""}`}
					style={{ fontFamily: settings?.Font, fontSize: `${settings?.FontScaling || 1}rem` }}
				>
					{displayedMessages.map(msg => (
						<Message {...msg} key={msg.id}></Message>
					))}
				</MessageList>
				<AnimatePresence>
					{showChatBox && active && (
						<motion.div
							initial={{ opacity: 0, y: 100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 100 }}
							id="chat-input--container"
							onClick={() => {
								document.getElementById("chat-input").focus();
							}}
						>
							<ChatInputContainer>
								<ReactTextareaAutocomplete
									onItemHighlighted={({ item }) => {
										setTimeout(() => {
											const name = item?.name;
											const node = document.getElementById(name);
											if (node) {
												//@ts-ignore
												const _ = node.parentNode?.parentNode?.parentNode?.scrollTo?.({
													top: node?.offsetTop,
													left: 0,
													behavior: "smooth",
												});
											}
										}, 100);
									}}
									movePopupAsYouType={true}
									loadingComponent={() => <span>Loading</span>}
									minChar={2}
									listClassName="auto-complete-dropdown"
									trigger={{
										"@": {
											dataProvider: token => {
												return allChatters
													.filter(chatter => chatter.startsWith(token))
													.map(chatter => ({ name: `${chatter}`, char: `@${chatter}` }));
											},
											component: UserItem,
											output: (item, trigger) => item.char,
										},
										":": {
											dataProvider: token => {
												return userEmotes
													.filter(emote =>
														emote?.code?.toLowerCase?.()?.includes?.(token?.toLowerCase?.())
													)
													.map(emote => ({
														name: `${emote.id || emote.name}`,
														char: `${emote.code}`,
														bttv: emote.bttv,
														ffz: emote.ffz,
													}));
											},
											component: EmoteItem,
											output: (item, trigger) => item.char,
										},
									}}
									onKeyPress={e => {
										if (e.which === 13 && !e.shiftKey) {
											sendMessage();
											setChatValue("");
											e.preventDefault();
										}
									}}
									name="chat-input"
									id="chat-input"
									rows="4"
									value={chatValue}
									onChange={e => {
										setChatValue(e.target.value);
									}}
								></ReactTextareaAutocomplete>
							</ChatInputContainer>
							{/* will be used in the future */}
							{/* <Tooltip title="Emote Picker" arrow>
						<img
							src={displayMotes[emoteIndex]}
							onClick={() => {
								setEmotePickerVisible(prev => !prev);
							}}
							onMouseEnter={() => {
								setEmoteIndex(Math.floor(Math.random() * displayMotes.length));
							}}
							alt=""
						/>
					</Tooltip> */}
						</motion.div>
					)}
				</AnimatePresence>
			</ChatContainer>
		</ChatMain>
	);
};

export default Chat;
