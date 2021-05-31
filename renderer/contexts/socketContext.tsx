import { useContext, createContext } from "react";
import { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import useSocket from "../hooks/useSocket";

interface SocketContextModel {
	socket: Socket;
}

export const socketContext = createContext<SocketContextModel>(null);

export const SocketContextProvider = props => {
	const options: Partial<ManagerOptions & SocketOptions> = {
		transports: ["websocket", "polling"],
		withCredentials: true,
		reconnection: true,
	};
	const socket = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL, options);

	return (
		<socketContext.Provider
			{...props}
			value={{
				socket,
			}}
		></socketContext.Provider>
	);
};

export const useSocketContext = () => {
	const context = useContext(socketContext);
	if (!context) throw new Error("useSocket must be used within a auth context provider");
	return context;
};
