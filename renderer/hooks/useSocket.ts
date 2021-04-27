import { useEffect, useRef } from "react";
import io from "socket.io-client";

const useSocket = (...args): any => {
	if (typeof window === "undefined") return [{}];
	const { current: socket } = useRef(io(...args));
	useEffect(() => {
		return () => {
			socket && socket.close();
		};
	}, [socket]);
	return [socket];
};

export default useSocket;
