import { useEffect, useState } from "react";
import { HeaderBody, IconSection } from "../../styles/header.styles";
import { useRouter } from "next/router";
import SettingsIcon from "@material-ui/icons/Settings";
import { ClearButton, PurpleButton } from "../../styles/button.styles";
import firebaseClient from "../../firebase/client";
import { TwitchUserModel } from "../../models/user.model";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import HomeIcon from "@material-ui/icons/Home";
import { Link } from "@material-ui/core";
const { ipcRenderer } = require("electron");

const Header = () => {
	const [chatUser, setChatUser] = useState<TwitchUserModel>({} as TwitchUserModel);
	const router = useRouter();

	const chatHeader = router.asPath.includes("chat");
	const { id: chatId } = router.query;

	useEffect(() => {
		(async () => {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SOCKET_URL}/resolveuser?user=${chatId}&platform=twitch`
			);
			const json = await response.json();
			setChatUser(json);
		})();
	}, [chatId]);

	const twitchUrl = `https://twitch.tv/${chatUser.display_name?.toLowerCase()}`;

	return (
		<HeaderBody>
			<IconSection className={`${chatHeader ? "chat-header" : ""}`}>
				{!chatHeader ? (
					<PurpleButton
						onClick={async () => {
							await firebaseClient.logout();
							router.push("/auth");
						}}
					>
						Sign out
					</PurpleButton>
				) : (
					<div>
						<a href={twitchUrl}>{chatUser.display_name}</a>
					</div>
				)}
				<div>
					<Link href="/channels">
						<a>
							<ClearButton>
								<HomeIcon />
							</ClearButton>
						</a>
					</Link>
					<ClearButton
						onClick={() => {
							ipcRenderer.send("open-settings");
						}}
					>
						<SettingsIcon />
					</ClearButton>
					<ClearButton>
						<MoreVertIcon />
					</ClearButton>
				</div>
			</IconSection>
		</HeaderBody>
	);
};

export default Header;
