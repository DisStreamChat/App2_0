import { useEffect, useState } from "react";
import { HeaderBody, IconSection } from "../../styles/header.styles";
import { useRouter } from "next/router";
import SettingsIcon from "@material-ui/icons/SettingsTwoTone";
import { ClearButton, PurpleButton } from "../../styles/button.styles";
import firebaseClient from "../../firebase/client";
import { TwitchUserModel } from "../../models/user.model";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import HomeIcon from "@material-ui/icons/Home";
import Link from "next/link";
import { useSocketContext } from "../../contexts/socketContext";
import { LiveIndicator } from "../shared/ui-components/LiveIndicator";
import styled from "styled-components";
import { useStats } from "../../hooks/useStats";
import FavoriteTwoToneIcon from "@material-ui/icons/FavoriteTwoTone";
import EmailTwoToneIcon from "@material-ui/icons/EmailTwoTone";
import PeopleAltTwoToneIcon from "@material-ui/icons/PeopleAltTwoTone";
import { GroupTwoTone } from "@material-ui/icons";
import { EmptyButton } from "../shared/ui-components/Buttons";
const { ipcRenderer } = require("electron");

const ChannelInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	a {
		text-decoration: underline;
		text-underline-offset: 0.15rem;
	}
`;

const Icons = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	button {
		display: flex;
		align-items: center;
	}
	& > div {
		display: flex;
		align-items: center;
		gap: 1rem;
		&:first-child {
			position: relative;
			&:after {
				content: "";
				position: absolute;
				top: 0;
				bottom: 0;
				right: -.75rem;
				border: 1px solid white;
			}
		}
	}
`;

const Header = () => {
	const [chatUser, setChatUser] = useState<TwitchUserModel>({} as TwitchUserModel);
	const { socket } = useSocketContext();
	const router = useRouter();

	const chatHeader = router.asPath.includes("chat");
	const initial = router.asPath.includes("initial");
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

	const stats = useStats(chatUser?.login);

	const twitchUrl = `https://twitch.tv/${chatUser.display_name?.toLowerCase()}`;
	if (initial) return <></>;

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
					<ChannelInfo>
						<LiveIndicator live={stats.isLive} />
						<a href={twitchUrl} target="_blank">
							{chatUser.display_name}
						</a>
					</ChannelInfo>
				)}
				<Icons>
					{chatHeader && (
						<div>
							<ClearButton>
								<FavoriteTwoToneIcon />
							</ClearButton>
							<ClearButton>
								<EmailTwoToneIcon />
							</ClearButton>
							<ClearButton>
								<GroupTwoTone />
							</ClearButton>
						</div>
					)}
					<div>
						{chatHeader && (
							<Link href="/channels">
								<a>
									<ClearButton>
										<HomeIcon />
									</ClearButton>
								</a>
							</Link>
						)}
						<ClearButton
							onClick={() => {
								ipcRenderer.send("open-settings");
							}}
						>
							<SettingsIcon />
						</ClearButton>
						{chatHeader && (
							<ClearButton>
								<MoreVertIcon />
							</ClearButton>
						)}
					</div>
				</Icons>
			</IconSection>
		</HeaderBody>
	);
};

export default Header;
