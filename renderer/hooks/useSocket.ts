import { useEffect, useRef } from "react";
import io from "socket.io-client";

const useSocket = (...args): any => {
	if (typeof window === "undefined") return {};
	const socketRef = useRef<any>(null);
	const { current: socket } = socketRef;
	useEffect(() => {
		socketRef.current = io(...args);
	}, []);

	useEffect(() => {
		return () => {
			socketRef.current && socketRef.current?.close?.();
		};
	}, []);
	return socket;
};

export default useSocket;
