export interface MessageModel {
	content: string;
	id: string;
	platform: string;
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
