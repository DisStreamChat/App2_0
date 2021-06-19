import { Filters, Highlights } from "./filter.model";

export interface Setting<T = string> {
	category: string;
	type: string;
	value: T;
	description: string;
	appOnly?: boolean;
	min?: number;
	max?: number;
}

export interface DefualtSettings {
	[key: string]: Setting;
}

export interface Settings {
	[key: string]: any;
}

export interface SettingsDocument {
	appSettings: Settings;
	filters: Filters;
	highlights: Highlights;
}
