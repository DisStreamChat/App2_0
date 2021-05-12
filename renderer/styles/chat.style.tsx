import styled from "styled-components";

export const Tab = styled.div`
	background: #212121aa;
	border: 1px solid #ffffffaa;
	font-size: 75%;
	border-bottom: none;
	border-radius: .5rem .5rem 0px 0px;
	&.active {
		background: #424242;
	}
	a{
		display: block;
		padding: .25rem .5rem;
	}
`;

export const TabContainer = styled.div`
	display: flex;
	/* gap: 0.25rem; */
`;
