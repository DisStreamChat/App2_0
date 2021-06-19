import { Filters, FilterType } from "../models/filter.model";

export const HandleFilters = (filters: Filters, messages: any[]) => {
	const filtersArray = Object.entries(filters)
		.map(([key, value]) => ({ ...value, name: key }))
		.filter(filter => filter.active);
	let outputMessages = [...messages];
	for (const filter of filtersArray) {
		switch (filter.type) {
			case FilterType.REGEX: {
				const filterText = new RegExp(filter.text);
				outputMessages = outputMessages.filter(message => (message.content as string).match(filterText));
				break;
			}
			case FilterType.TEXT: {
				outputMessages = outputMessages.filter(message => message.content.inclues(filter.text));
				break;
			}
		}
	}
	return outputMessages;
};
