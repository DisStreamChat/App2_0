import { useEffect, useState, useRef } from "react";

interface StatsModel {
	isLive: boolean;
	viewer_count: number;
}

export const useStats = (channelName: string): StatsModel => {
	const [stats, setStats] = useState<StatsModel>({ isLive: false, viewer_count: 0 });

	const getStats = async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/v2/twitch/stats?name=${channelName}`);
		const json = await response.json();
		setStats(json);
	};

	useEffect(() => {
		let interval;
		if (channelName && channelName !== "undefined") {
			getStats();
			interval = setInterval(getStats, 6000*2);
		}
		return () => {
			console.log(`clearing ${interval}`);
			clearInterval(interval);
		};
	}, [channelName]);

	return stats;
};
