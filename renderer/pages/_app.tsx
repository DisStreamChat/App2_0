import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import GlobalStyle from "../components/globalStyle";
import styled from "styled-components";
import Header from "../components/header/header";
import { useRouter } from "next/router";
import { MenuItem, MenuItemConstructorOptions, remote } from "electron";
import { AppContext, AppContextProvider } from "../contexts/appContext";
import { AuthContextProvider } from "../contexts/authContext";
import { SocketContextProvider, useSocketContext } from "../contexts/socketContext";
import { useInterval } from "react-use";
import { ipcRenderer } from "electron";
import sha1 from "sha1";
import firebaseClient from "../firebase/client";
import useSocketEvent from "../hooks/useSocketEvent";

const Border = styled.div`
	border: 1px solid black;
	width: calc(100vw - 1px);
	height: calc(100vh - 1px);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10000000000000000;
	pointer-events: none;
`;

const mainPaths = ["channels", "chat", "auth"];

function MyApp({ Component, pageProps }) {
	const [windowFocused, setWindowFocused] = useState(true);
	const { settings, titleBarRef, tabChannels } = useContext(AppContext);
	const { socket } = useSocketContext();
	const router = useRouter();

	useEffect(() => {
		(async () => {
			if (typeof window !== "undefined" && !router.asPath.includes("initial")) {
				if (document.querySelector(".titlebar")) return;
				const customTitlebar = await import("custom-electron-titlebar");
				const template: (MenuItemConstructorOptions | MenuItem)[] = [
					{
						label: "View",
						submenu: [
							{
								label: "Always on Top",
								type: "checkbox",
								checked: true,
								click: ({ checked }) => ipcRenderer.send("setAlwaysOnTop", checked),
							},
							{
								label: "Channel Options",
							},
							{
								label: "Filters",
								click: () => ipcRenderer.send("open-menu", "filters"),
							},
							{
								label: "Highlights and Mentions",
								click: () => ipcRenderer.send("open-menu", "highlights"),
							},
						],
					},
					{
						label: "Channel Info",
						submenu: [
							{
								label: "Followers",
							},
							{
								label: "Subscribers",
							},
						],
					},
					{
						label: "Help",
						submenu: [
							{
								label: "Website",
							},
							{
								label: "About/Help",
							},
							{
								label: "Check for updates",
							},
						],
					},
				];
				const menu = remote.Menu.buildFromTemplate(template);

				let myTitleBar = new customTitlebar.Titlebar({
					backgroundColor: customTitlebar.Color.fromHex("#17181ba1"),
					maximizable: false,
					menu: mainPaths.find(menuPath => {
						return router.asPath.includes(menuPath);
					})
						? menu
						: null,
				});
				titleBarRef.current = myTitleBar;
				myTitleBar.updateTitle("DisStreamChat");
				myTitleBar.setHorizontalAlignment("center");
			}
		})();
	}, []);

	const joinAllChannels = async () => {
		const channels = [];
		for (const { id } of tabChannels) {
			if (!id) continue;
			const firebaseId = sha1(id);
			const docRef = firebaseClient.db.collection("Streamers").doc(firebaseId);
			const doc = await docRef.get();
			if (doc.exists) {
				const data = doc.data();
				const { guildId, liveChatId, TwitchName: twitchName } = data;
				channels.push({ guildId, liveChatId, twitchName });
			} else {
				const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/v2/twitch/exists?channel=${id}`);
				const json = await response.json();
				const { data } = json;
				channels.push({ twitchName: data.login });
			}
		}
		for (const channel of channels) {
			socket?.emit?.("add", channel);
		}
	};

	useEffect(() => {
		joinAllChannels();
	}, [tabChannels, socket]);

	// useEffect(() => {
	// 	if (socket) {
	// 		socket.emit("add", {
	// 			twitchName: "dscnotifications",
	// 		});
	// 	}
	// }, [socket]);

	// useSocketEvent(socket, "left-all", () => {
	// 	socket.emit("add", {
	// 		twitchName: "dscnotifications",
	// 	});
	// });

	// useSocketEvent(socket, "connect", () => {
	// 	socket.emit("add", {
	// 		twitchName: "dscnotifications",
	// 	});
	// });
	useSocketEvent(socket, "connect", () => {
		joinAllChannels();
	});

	const currentWindow = remote?.getCurrentWindow?.();

	const focusHandler = () => setWindowFocused(true);
	const unfocusHandler = () => setWindowFocused(false);

	useEffect(() => {
		if (currentWindow) {
			// the typing for browserWindow only allows certain events, but I am adding my own to handle hotkey focus
			// @ts-ignore
			currentWindow.on("key-focus", focusHandler);
			// @ts-ignore
			currentWindow.on("key-blur", unfocusHandler);
		}
	}, []);

	useInterval(() => {
		// there is an odd error where the socket disconnects when opening external links
		// this fixes it by making external links open in a new tab
		const allLinks = [...document.querySelectorAll("a")];
		for (const link of allLinks) {
			if (link.hostname != location.hostname) {
				link.rel = "noopener";
				link.target = "_blank";
			}
		}
	}, 1000);

	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/logo.png" />
				<link
					rel="preload"
					href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
					as="style"
				/>
				<link rel="preload" href="https://api.disstreamchat.com/fonts" as="style" />
				<link href="https://api.disstreamchat.com/fonts" rel="stylesheet" />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
					rel="stylesheet"
				/>
				<link
					rel="preload"
					href="https://cdn.jsdelivr.net/gh//GypsyDangerous/simple-css-reset/reset.css"
					as="style"
				/>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh//GypsyDangerous/simple-css-reset/reset.css" />
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.css"
					integrity="sha512-DanfxWBasQtq+RtkNAEDTdX4Q6BPCJQ/kexi/RftcP0BcA4NIJPSi7i31Vl+Yl5OCfgZkdJmCqz+byTOIIRboQ=="
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					as="style"
					href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.css"
					integrity="sha512-DanfxWBasQtq+RtkNAEDTdX4Q6BPCJQ/kexi/RftcP0BcA4NIJPSi7i31Vl+Yl5OCfgZkdJmCqz+byTOIIRboQ=="
					crossOrigin="anonymous"
				/>
				<title>DisStreamChat</title>
			</Head>
			<GlobalStyle />
			{mainPaths.find(path => router.asPath.includes(path)) && windowFocused && settings.ShowBorder && <Border />}
			{mainPaths.find(path => router.asPath.includes(path)) && <Header />}
			<Component {...pageProps} />
		</>
	);
}

const App = ({ Component, pageProps }) => {
	return (
		<AuthContextProvider>
			<SocketContextProvider>
				<AppContextProvider>
					<MyApp Component={Component} pageProps={pageProps}></MyApp>
				</AppContextProvider>
			</SocketContextProvider>
		</AuthContextProvider>
	);
};

export default App;
