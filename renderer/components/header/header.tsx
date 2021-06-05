import { useContext, useEffect, useRef, useState } from "react";
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
import FavoriteIcon from "@material-ui/icons/Favorite";
import EmailTwoToneIcon from "@material-ui/icons/EmailTwoTone";
import { GroupTwoTone } from "@material-ui/icons";
import { AnimatePresence } from "framer-motion";
import { AppContext } from "../../contexts/appContext";
import { apiFetch } from "../../functions/fetching";
import { useAuth } from "../../contexts/authContext";
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
		gap: 0.2rem;
	}
	& > div {
		display: flex;
		align-items: center;
		gap: 1rem;
		&.chat-icons:first-child {
			position: relative;
			&:after {
				content: "";
				position: absolute;
				top: 0;
				bottom: 0;
				right: -0.75rem;
				border: 1px solid white;
			}
		}
	}
`;

const Header = () => {
	const [chatUser, setChatUser] = useState<TwitchUserModel>({} as TwitchUserModel);
	const router = useRouter();

	const chatHeader = router.asPath.includes("chat");
	const initial = router.asPath.includes("initial");
	const { id: chatId } = router.query;
	const { settings, twitchDetails, appHovered, appActive: showHeader } = useContext(AppContext);
	const [isFollowing, setIsFollowing] = useState(false);
	const { user } = useAuth();

	const id = twitchDetails?.id;
	const uid = user?.uid;
	useEffect(() => {
		(async () => {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SOCKET_URL}/resolveuser?user=${chatId}&platform=twitch`
			);
			const json = await response.json();
			setChatUser(json);
		})();
	}, [chatId]);

	useEffect(() => {
		(async () => {
			if (id && chatId) {
				const following = await apiFetch(`v2/twitch/following?user=${id}&key=_id`);
				setIsFollowing(following.includes(chatId));
			}
		})();
	}, [id, chatId]);

	const stats = useStats(chatUser?.login);

	const twitchUrl = `https://twitch.tv/${chatUser.display_name?.toLowerCase()}`;
	if (initial) return <></>;

	return (
		<AnimatePresence>
			{showHeader && (
				<HeaderBody initial={{ scaleY:0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}>
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
								<LiveIndicator live={stats?.isLive} />
								<a href={twitchUrl} target="_blank">
									{chatUser.display_name}
								</a>
							</ChannelInfo>
						)}
						<Icons>
							{chatHeader && (
								<div className={`${chatHeader ? "chat-icons" : ""}`}>
									<ClearButton
										onClick={async () => {
											const wasFollowing = !!isFollowing;
											setIsFollowing(prev => !prev);
											const otc = (
												await firebaseClient.db.collection("Secret").doc(uid).get()
											).data().value;

											const response = await apiFetch(
												`v2/twitch/follow?user=${id}&channel=${chatId}&id=${uid}&otc=${otc}`,
												{
													method: wasFollowing ? "DELETE" : "PUT",
												}
											);
											if (response !== "success") setIsFollowing(wasFollowing);
										}}
									>
										{isFollowing ? <FavoriteIcon /> : <FavoriteTwoToneIcon />}
									</ClearButton>
									<ClearButton>
										<EmailTwoToneIcon />
									</ClearButton>
									<ClearButton>
										<GroupTwoTone />
										{stats?.viewer_count}
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
			)}
		</AnimatePresence>
	);
};

export default Header;
