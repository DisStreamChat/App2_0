import React, { useEffect } from "react";
import firebaseClient from "../firebase/client";
import nookies, { parseCookies, destroyCookie } from "nookies";
import { ipcRenderer } from "electron";
import styled from "styled-components";

const Main = styled.main`
	width: 100vw;
	height: 100vh;
	display: grid;
	place-items: center;
`;

const Initial = () => {
	useEffect(() => {
		firebaseClient.auth.onAuthStateChanged(async user => {
			ipcRenderer.send("app-ready");
		});
	}, []);

	return (
		<Main>
			<img src="/images/discord.gif" alt="" />
		</Main>
	);
};

export default Initial;
