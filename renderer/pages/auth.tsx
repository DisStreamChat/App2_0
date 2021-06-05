import styled from "styled-components";
import { DiscordButton, TwitchButton } from "../styles/button.styles";
import firebaseClient from "../firebase/client";
import { useRouter } from "next/router";
const { ipcRenderer, remote } = require("electron");
import { v4 } from "uuid";
import nookies from "nookies";
import { verifyIdToken } from "../firebase/admin";
import { GetServerSideProps } from "next";
import { useState } from "react";

const AuthContainer = styled.div`
	width: 100vw;
	height: calc(100vh - 30px);
	background: blue;
	background: var(--background-transparent-gray);
	display: flex;
	align-items: center;
	justify-content: center;
`;

const AuthBody = styled.div`
	width: 100%;
	max-width: 315px;
	height: 380px;
	background: radial-gradient(var(--disstreamchat-blue), #214d69);
	border-radius: 0.5rem;
	padding: 50px;
	&,
	form {
		gap: 0.5rem;
		justify-content: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		button {
			width: 100%;
		}
		.legal {
			a {
				text-decoration: underline;
			}
			display: flex;
			margin-top: 1rem;
			#terms-check {
				margin-right: 0.5rem;
			}
		}
	}
`;

const AuthHeader = styled.h1`
	font-size: 18px;
	font-weight: 700;
	text-align: center;
`;

const AuthSubHeader = styled.h2`
	margin: 6px 0;
	font-size: 14px;
`;

const Logo = styled.img`
	margin-right: 1ch;
	&.white {
		filter: grayscale(1) brightness(10000%);
	}
`;

const AuthPage = () => {
	const router = useRouter();

	const [termsChecked, setTermsChecked] = useState(false)

	const loginWithTwitch = async () => {
		try {
			if(!termsChecked) return
			console.log("logging in with twitch ")
			const id = v4();
			const oneTimeCodeRef = firebaseClient.db.collection("oneTimeCodes").doc(id);

			oneTimeCodeRef.onSnapshot(async snapshot => {
				const data = snapshot.data();
				if (data) {
					const token = data.authToken;
					nookies.set(null, "auth-token", token, { path: "/" });
					await firebaseClient.auth.signInWithCustomToken(token);
					router.push("/channels");
				}
			});
			await remote.shell.openExternal(
				"https://api.disstreamchat.com/oauth/twitch/?otc=" + id
			);
		} catch (err) {
			const receiveMessage = async (event, data) => {
				const json = data;
				await firebaseClient.auth.signInWithCustomToken(json.token);
			};

			router.push("/channels");
			// open a popup window to the twitch oauth url
			// use old pop up method
			ipcRenderer.once("log-me-in", receiveMessage);

			ipcRenderer.send("login");
		}
	};

	const submitHandler = (e) => {
		e.preventDefault();
	}

	return (
		<AuthContainer>
			<AuthBody>
				<AuthHeader>Login to DisStreamChat</AuthHeader>
				<AuthSubHeader>Connect with:</AuthSubHeader>
				<form onSubmit={submitHandler}>
					<TwitchButton onClick={loginWithTwitch} type="submit">
						<Logo height="30" width="30" src="/images/twitch.svg"></Logo>Twitch
					</TwitchButton>
					<DiscordButton type="submit">
						<Logo className="white" width="20" src="/images/discord_logo.png"></Logo>
						Discord
					</DiscordButton>
					<div className="legal">
						<input
							required
							id="terms-check"
							type="checkbox"
							name="terms"
							//@ts-ignore
							value={termsChecked}
							onChange={e => setTermsChecked(e.target.checked)}
						/>
						<label htmlFor="terms-check">
							I accept the{" "}
							<a
								href="https://disstreamchat.com/terms"
								target="_blank"
								rel="noopener noreferrer"
							>
								terms and conditions
							</a>{" "}
							and{" "}
							<a
								href="https://disstreamchat.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
							>
								privacy policy
							</a>
						</label>
					</div>
				</form>
			</AuthBody>
		</AuthContainer>
	);
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { req, res, params } = context;

	const cookies = nookies.get(context);
	const token = cookies["auth-token"]
	const verified = await verifyIdToken(token ?? "")
	if (verified) {
		res.writeHead(307, { location: "/channels" }).end()
	}
	return { props: {} };
};

export default AuthPage;
