import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import styled from "styled-components";

export const SaveSection = styled(motion.div)`
	position: fixed;
	z-index: 1000;
	width: 85%;
	left: 50%;
	bottom: 20px;
	height: 50px;
	border-radius: 0.25rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: var(--background-dark-gray);
	padding: 0.5rem 1rem;
	box-sizing: content-box;
	border: none;
	div:last-child > * + * {
		margin-left: 1rem;
	}
`;
import { RedButton, GreenButton } from "./Buttons";
import { useBeforeunload } from "react-beforeunload";

export interface saveBarProps {
	changed?: boolean;
	reset: () => void;
	save: () => void;
}

export const SaveBar = ({ changed, reset, save }: saveBarProps) => {
	useBeforeunload(e => {
		if (changed) {
			e.preventDefault();
		} else {
			return false;
		}
	});

	return (
		<AnimatePresence>
			{changed && (
				<SaveSection
					initial={{ y: 20, x: "-50%", opacity: 0 }}
					exit={{ y: 20, x: "-50%", opacity: 0 }}
					animate={{ y: 0, x: "-50%", opacity: 1 }}
					transition={{ type: "spring" }}
				>
					<div>You have unsaved Changes</div>
					<div>
						<RedButton onClick={reset}>Reset</RedButton>
						<GreenButton onClick={save}>Save</GreenButton>
					</div>
				</SaveSection>
			)}
		</AnimatePresence>
	);
};
