import styled from "styled-components";
import { motion } from "framer-motion";

export const HeaderBody = styled(motion.header)`
	transform-origin: top center;
	position: fixed;
	top: 30px;
	overflow: hidden;
	height: 65px;
	width: 100%;
	background: var(--background-transparent-gray);
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const IconSection = styled.div`
	flex: 1;
	display: flex;
	justify-self: flex-end;
	justify-content: space-around;
	max-width: none;
	height: 100%;
	padding: 0 1rem;
	align-items: center;
	&.chat-header {
		justify-content: space-between;
	}
`;
