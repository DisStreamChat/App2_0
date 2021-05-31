import styled from "styled-components";
import { motion } from "framer-motion";

export const Tab = styled.div`
	background: #212121;
	/* color: black; */
	clip-path: polygon(0 0, 80% 0, 100% 100%, 0% 100%);
	font-size: 75%;
	border-bottom: none;
	border-radius: 0.25rem 0 0px 0px;
	padding-right: 1.25rem;
	display: flex;
	align-items: center;
	svg {
		opacity: 0;
		transition: .25s;
		transform: scale(.5)
	}
	&:hover, &:active {
		svg {
			opacity: 1
		}
	} 
	&.active {
		background: #424242;
	}
	a {
		display: block;
		padding: 0.25rem 0.5rem;
	}
`;

export const TabContainer = styled(motion.div)`
	display: flex;
	/* gap: 0.25rem; */
	background: var(--background-transparent-gray);
	overflow: hidden;
	flex-wrap: wrap;

`;
