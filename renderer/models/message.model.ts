export interface MessageModel {
	content: string;
	id: string;
	platform: string;
	streamer: string;
	sentAt: number;
	read: boolean;
	moddable: boolean;
	type: string;
	highlighted: boolean;
	sender: {
		avatar: string;
		name: string;
		color: string;
		badges: {
			[key: string]: {
				title: string;
				image: string;
			};
		};
	};
}
