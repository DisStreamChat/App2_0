import styled from "styled-components";
import { motion } from "framer-motion";
import { Main } from "./global.styles";

export const ChannelMain = styled(Main)`
	padding: 0 4rem;
	padding-top: 1rem;
	width: 100%;
	height: calc(100vh - (80px + 1rem));
	display: flex;
	flex-direction: column;
	align-items: center;
	background: var(--background-transparent-gray);
	h1 {
		font-family: Poppins;
		font-size: 32px;
	}
	@media screen and (max-width: 725px){
		padding: 0 2rem;
	}
	@media screen and (max-width: 500px){
		padding: 0 1rem;
	}
	@media screen and (max-width: 500px){
		padding: 0 .5rem;
	}
`;

export const ModChannels = styled.div`
	height: 65vh;
	overflow-y: auto;
	margin-bottom: 0.5rem;
	position: relative;
	width: 100%;
	display: flex;
	align-items: center;
	flex-direction: column;
`;
