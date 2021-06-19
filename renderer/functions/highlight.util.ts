import { Highlight, Highlights, HighlightType } from "../models/filter.model";
import { MessageModel } from "../models/message.model";

export const shouldHighlight = (msg: MessageModel, highlights: Highlights): boolean => {
	const highlightArray = Object.entries(highlights).map(([key, value]) => ({ ...value, name: key }));
	return !!highlightArray.find(highlight => {
		let highlightText: string | RegExp = highlight.text;
		if (highlight.regex) {
			highlightText = new RegExp(highlightText);
		}
		switch (highlight.type) {
			case HighlightType.MESSAGE: {
				return msg.content.match(highlightText);
			}
			case HighlightType.USER: {
				return msg.sender.name.match(highlightText);
			}
			case HighlightType.BADGE: {
				return Object.keys(msg.sender.badges).find(name => name.match(highlightText));
			}
		}
	});
};
