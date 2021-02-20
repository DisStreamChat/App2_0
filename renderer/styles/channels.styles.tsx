import styled from "styled-components";
import { motion } from "framer-motion";
import { Main } from "./global.styles";

export const ChannelMain = styled(Main)`
	padding-top: 1rem;
	width: 100%;
	height: calc(100vh - (80px + 1rem));
	display: flex;
	flex-direction: column;
	align-items: center;
	background: var(--background-transparent-gray);
`;
