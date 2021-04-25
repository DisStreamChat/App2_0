import Head from "next/head";
import { useEffect, useState } from "react";
import GlobalStyle from "../components/globalStyle";
import styled from "styled-components";
import Header from "../components/header/header";
import { useRouter } from "next/router";
import { remote } from "electron";
import { AppContextProvider } from "../contexts/appContext";
import { AuthContextProvider } from "../contexts/authContext";

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

function MyApp({ Component, pageProps }) {
	const [windowFocused, setWindowFocused] = useState(true);

	useEffect(() => {
		(async () => {
			if (typeof window !== "undefined") {
				if (document.querySelector(".titlebar")) return;
				const customTitlebar = await import("custom-electron-titlebar");
				let MyTitleBar = new customTitlebar.Titlebar({
					backgroundColor: customTitlebar.Color.fromHex("#17181ba1"),
					menu: null,
					maximizable: false,
				});
				MyTitleBar.updateTitle("DisStreamChat");
				MyTitleBar.setHorizontalAlignment("left");
			}
		})();
	}, []);

	const router = useRouter();

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
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
					rel="stylesheet"
				/>
				<link
					rel="preload"
					href="https://cdn.jsdelivr.net/gh//GypsyDangerous/simple-css-reset/reset.css"
					as="style"
				/>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/gh//GypsyDangerous/simple-css-reset/reset.css"
				/>
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
			<AuthContextProvider>
				<AppContextProvider>
					{!router.asPath.includes("settings") && windowFocused && <Border />}
					{!router.asPath.includes("auth") && !router.asPath.includes("settings") && (
						<Header />
					)}
					<Component {...pageProps} />
				</AppContextProvider>
			</AuthContextProvider>
		</>
	);
}

export default MyApp;
