import React, { useMemo, useReducer, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { SearchBox, BooleanSetting, ColorSetting, ListSetting, RangeSetting, SelectSetting } from "disstreamchat-utils";
import styled from "styled-components";
import admin from "../firebase/admin";

interface Setting {
	category: string;
	name: string;
	type: string;
	value?: string | { [key: string]: any };
	placeholder?: string;
	min?: number;
	max: number;
	options?: any[];
	open?: boolean;
}

interface SettingProps extends Setting {
	onClick: (name: string) => void;
	onChange: (name: string, val: any) => void;
	defaultValue?: string;
}

const settingMap = {
	boolean: BooleanSetting,
	color: ColorSetting,
	number: RangeSetting,
	list: ListSetting,
	selector: SelectSetting,
};

const SettingComponent = (props: SettingProps) => {
	const { type } = props;
	const Elt = useMemo(() => settingMap[type], [type]);
	let val = props.value;
	if (type === "selector") val = { label: props.value, value: props.value };
	return Elt ? <Elt {...props} value={val}></Elt> : <></>;
};

const Settings = styled.ul`
	width: 100%;
`;

enum Actions {
	UPDATE = "update",
	SET = "set",
	RESET = "reset",
}

export interface Action {
	server?: string;
	type: string;
	value?: any;
	key?: string;
}

const settingReducer = (state, action: Action) => {
	switch (action.type) {
		case Actions.UPDATE:
			return {
				...state,
				[action.key]: typeof action.value === "function" ? action.value(state[action.key]) : action.value,
			};
		case Actions.SET:
			return action.value;
		default:
			return state;
	}
};

const Home = ({ settings: defaultSettings }) => {
	const [search, setSearch] = useState("");

	const allSettings: Setting[] = Object.entries(defaultSettings || {})
		.map(([key, val]: [string, any]) => ({
			...val,
			name: key,
		}))
		.sort((a, b) => {
			const categoryOrder = a.type.localeCompare(b.type);
			const nameOrder = a.name.localeCompare(b.name);
			return !!categoryOrder ? categoryOrder : nameOrder;
		})
		.filter(setting => {
			return setting.name
				.match(/[A-Z][a-z]+|[0-9]+/g)
				.join(" ")
				.toLowerCase()
				.includes(search.toLowerCase());
		});
	const [openItem, setOpenItem] = useState(null);
	const [state, dispatch] = useReducer(settingReducer, {});

	return (
		<div>
			<Settings>
				{allSettings.map(setting => (
					<SettingComponent
						{...setting}
						open={openItem === setting.name}
						onClick={name => setOpenItem(prev => (prev === name ? null : name))}
						value={state[setting.name]}
						//@ts-ignore
						defaultValue={setting.value}
						options={setting.options?.map(option => ({
							value: option,
							label: option,
						}))}
						onChange={(name, val) => {
							if (val.value) val = val.value;
							dispatch({ type: Actions.UPDATE, key: setting.name, value: val });
						}}
					></SettingComponent>
				))}
			</Settings>
		</div>
	);
};

export default Home;

export async function getServerSideProps() {
	let settings = {};
	let categories = [];
	const settingsRef = await admin.firestore().collection("defaults").doc("settings16").get();
	settings = settingsRef.data()?.settings;
	categories = [
		//@ts-ignore
		...new Set(Object.values(settings || {}).map(val => val.category)),
	]
		.filter(Boolean)
		.sort();

	return { props: { settings } };
}
