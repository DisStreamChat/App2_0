import { BooleanSetting, ColorSetting, ListSetting, RangeSetting, SearchBox, SelectSetting } from "disstreamchat-utils";
import { isEqual } from "lodash";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import styled from "styled-components";

import { SaveBar } from "../components/shared/ui-components/SaveBar";
import { useAuth } from "../contexts/authContext";
import firebaseClient from "../firebase/client";
import { motion } from "framer-motion";
import { useTitle } from "../hooks/useTitle";

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

const SettingsMain = styled.div`
	padding: 0 2rem;
	height: calc(100vh - 30px);
	overflow: auto;
`;

export const SearchContainer = styled(motion.div)`
	position: sticky;
	top: 0;
	z-index: 100;
	display: grid;
	place-items: center;
	& > span {
		justify-content: center;
		align-items: center;
		width: 100%;
		input {
			margin-left: 1.5rem !important;
		}
	}
`;

const Home = () => {
	const [search, setSearch] = useState("");
	const [defaultSettings, setDefaultSettings] = useState([]);
	useTitle("Settings");
	const { user } = useAuth();

	const [settings] = useDocumentData(firebaseClient.db.collection("defaults").doc("settings16"));

	useEffect(() => {
		setDefaultSettings(settings?.settings);
	}, [settings]);

	const allSettings: Setting[] = useMemo(
		() =>
			Object.entries(defaultSettings || {})
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
				}),
		[search, defaultSettings]
	);
	const [openItem, setOpenItem] = useState(null);
	const [state, dispatch] = useReducer(settingReducer, {});

	const [data, loading, error] = useDocumentData(firebaseClient.db.collection("Streamers").doc(user?.uid));

	const appSettings = data?.appSettings;
	useEffect(() => {
		if (appSettings) {
			dispatch({ type: Actions.SET, value: appSettings });
		}
	}, [appSettings]);

	const changed = appSettings && !isEqual(appSettings, state);

	const save = async () => {
		firebaseClient.db.collection("Streamers").doc(user.uid).set(
			{
				appSettings: state,
			},
			{ merge: true }
		);
	};

	return (
		<SettingsMain>
			<SearchContainer>
				<SearchBox
					search={search}
					onChange={val => setSearch(val)}
					resetSearch={() => setSearch("")}
				></SearchBox>
			</SearchContainer>
			<Settings>
				{allSettings.map(setting => (
					<SettingComponent
						key={setting.name}
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
			<SaveBar
				changed={changed}
				save={save}
				reset={() => {
					dispatch({ type: Actions.SET, value: appSettings });
				}}
			/>
		</SettingsMain>
	);
};

export default Home;
