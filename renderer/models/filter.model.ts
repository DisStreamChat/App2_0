export enum FilterType {
	REGEX = "regex",
	TEXT = "text",
}

export interface Filter {
	text: string;
	type: FilterType;
	active: boolean;
}

export interface Filters {
	[key: string]: Filter;
}

export enum HighlightType {
	MESSAGE = "message",
	USER = "user",
	BADGE = "badge",
}

export interface Highlight {
	type: HighlightType,
	text: string,
	active: boolean;
	color: string;
	regex: boolean;
}