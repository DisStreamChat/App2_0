import styled from "styled-components";
import { motion } from "framer-motion";

interface TabProps {
	hasUnreadMessages?: boolean;
	hasHighlightMatches?: boolean;
}

export const Tab = styled.div`
	background: #212121;
	/* color: black; */
	height: 28px;
	border-top: 1px solid
		${({ hasUnreadMessages, hasHighlightMatches }: TabProps) =>
			hasHighlightMatches ? "#2e86de" : hasUnreadMessages ? "#ee5253" : "gray"};
	/* clip-path: polygon(1rem 0%, 100% 0%, 100% 100%, 0 100%, 0 1rem); */
	font-size: 75%;
	border-bottom: none;
	padding-left: 0.75rem;
	display: flex;
	align-items: center;
	svg {
		opacity: 0;
		transition: 0.25s;
		transform: scale(0.5);
	}
	&:hover,
	&:active {
		svg {
			opacity: 1;
		}
	}
	&.active {
		background: #424242;
		border-top: 1px solid #2e86de;
	}
	a {
		display: block;
		padding: 0.25rem 0.5rem;
	}
`;

export const TabContainer = styled(motion.div)`
	display: flex;
	transform-origin: top center;
	/* gap: 0.25rem; */
	background: var(--background-transparent-gray);
	overflow: hidden;
	flex-wrap: wrap;
	z-index: 10000;
`;
