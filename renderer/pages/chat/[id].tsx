import { useRouter } from "next/router";
import React, { useState } from "react";
import { Main } from "../../styles/global.styles";
import useSocket from "../../hooks/useSocket";
import useSocketEvent from "../../hooks/useSocketEvent";
import { Message, MessageList } from "disstreamchat-utils";
import { MessageModel } from "../../models/message.model";

const Chat = () => {
	const router = useRouter();
	const { id } = router.query;
	const [socket] = useSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
		transports: ["websocket"],
		reconnect: true,
	});
	const [messages, setMessages] = useState<MessageModel[]>([]);
	socket?.on?.("connection_error", console.log);

	useSocketEvent(socket, "imConnected", () => {
		socket.emit("addme", { TwitchName: "dav1dsnyder404" });
	});

	useSocketEvent(socket, "chatmessage", msg => {
		console.log(msg);
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
		// socket.emit("addme", { twitchName: "dav1dsnyder404" });
	});

	return (
		<Main>
			<MessageList>
				{messages.map(msg => (
					<Message {...msg}></Message>
				))}
			</MessageList>
		</Main>
	);
};

export default Chat;
