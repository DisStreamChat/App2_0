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
	background: linear-gradient(
		119.36deg,
		rgba(23, 24, 27, 0.631373) 21.35%,
		rgba(36, 37, 42, 0.631373) 76.56%
	);
`;
