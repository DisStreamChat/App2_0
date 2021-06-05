import fetch, { Response, RequestInit } from "node-fetch";

export const apiFetch = async <T = any>(endpoint: string, init?: RequestInit): Promise<T> => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/${endpoint}`, init);
	try {
		return await response.json() as T;
	} catch (err) {
		console.log(err.message)
		return null;
	}
};
