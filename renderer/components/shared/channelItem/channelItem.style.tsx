import styled from "styled-components";

export const ChannelItemBody = styled.div`
	display: flex;
	align-items: center;
	width: 95%;
	min-height: 100px;
	margin: 0.5rem 0;
	border-radius: 0.5rem;
	background: #2a2c30;
	box-shadow: 3px 3px 5px -2px #0b0c0e;
	transition: 0.25s;
	animation: fade-in 0.5s ease-in-out forwards;
`;

export const ChannelProfilePicture = styled.div`
	img {
		max-width: 100%;
		border-radius: 50%;
		min-width: 25px;
	}
	width: 100px;
	height: -webkit-fit-content;
	height: -moz-fit-content;
	height: fit-content;
	display: flex;
	align-items: center;
	padding: 0 1.5rem;
	position: relative;
	background: none !important;
	&:after {
		content: "";
		position: absolute;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		right: 24px;
		bottom: 0;
		display: block;
		background: ${(props: { live: boolean }) => (props.live ? "#e91916" : "#515151")};
	}
`;

export const ChannelInfo = styled.div`
	display: flex;
	align-items: center;
	height: 100px;
	width: 100%;
	padding-right: 1.5rem;
	justify-content: space-between;
	.channel-name {
		text-transform: capitalize;
		padding-right: 0.5rem;
	}
`;
