import { useRouter } from "next/router";
import React from "react";
import { Main } from "../../styles/global.styles";
import useSocket from "../../hooks/useSocket";
import useSocketEvent from "../../hooks/useSocketEvent";

const Chat = () => {
	const router = useRouter();
	const { id } = router.query;
	const [socket] = useSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
		transports: ["websocket"],
		reconnect: true,
	});
	socket?.on?.("connection_error", console.log);

	useSocketEvent(socket, "imConnected", () => {
		socket.emit("addme", { TwitchName: "dav1dsnyder404" });
	});

	useSocketEvent(socket, "chatmessage", msg => {
		console.log(msg);
		// socket.emit("addme", { twitchName: "dav1dsnyder404" });
	});

	return <Main>{id}</Main>;
};

export default Chat;
