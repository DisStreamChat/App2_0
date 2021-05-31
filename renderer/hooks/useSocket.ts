import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

const useSocket = (...args): Socket => {
	if (typeof window === "undefined") return {} as any;
	const socketRef = useRef<Socket>(null);
	const { current: socket } = socketRef;
	useEffect(() => {
		socketRef.current = io(...args);
		socketRef.current.once("disconnect", () => {
			console.log("disconnected")
		})
	}, []);

	useEffect(() => {
		return () => {
			if (socketRef.current) socketRef.current?.disconnect?.();
		};
	}, []);
	return socket;
};

export default useSocket;
