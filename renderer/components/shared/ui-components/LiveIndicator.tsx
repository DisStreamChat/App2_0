import styled from "styled-components";

export const LiveIndicator = styled.div`
	width: 15px;
	height: 15px;
	border-radius: 50%;
	display: block;
	background: ${(props: { live: boolean }) => (props.live ? "#e91916" : "#515151")};
`;
