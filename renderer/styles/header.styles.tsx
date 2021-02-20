import styled from "styled-components";

export const HeaderBody = styled.header`
	position: absolute;
	top: 0;
	height: 65px;
	width: 100vw;
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

	align-items: center;
`;
