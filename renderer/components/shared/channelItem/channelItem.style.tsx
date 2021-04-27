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
	padding: 1rem 0;
	@media screen and (max-width: 775px) {
		&,
		& * {
			font-size: 0.75rem !important;
		}
		padding: 0.5rem 0;
	}
	@media screen and (max-width: 500px) {
		&,
		& * {
			font-size: 0.6rem !important;
		}
		button * {
			font-size: 0.75rem !important;
		}
	}
`;

export const ChannelSearchBody = styled(ChannelItemBody)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 1rem;
	.settings--searchbox{
		font-family: Poppins;
		font-weight: bold;
	}
	@media screen and (max-width: 775px) {
		&,
		& * {
			font-size: 0.75rem !important;
		}
		padding: 0.5rem !important;
	}
`;

export const ChannelSearchSection = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`

export const ChannelProfilePicture = styled.div`
	img {
		max-width: 100%;
		border-radius: 50%;
		min-width: 80px;
		@media screen and (max-width: 750px) {
			min-width: 50px;
		}
		@media screen and (max-width: 585px) {
			display: none;
		}
	}
	width: 150px;
	@media screen and (max-width: 585px) {
		width: 50px;
	}
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
		@media screen and (max-width: 585px) {
			right: 15px;
			bottom: -6px;
		}
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

export const ChannelButtons = styled.div`
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
	margin-left: 1rem;
	justify-content: center;
	button,
	button * {
		white-space: nowrap;
	}
	@media screen and (max-width: 400px) {
		margin: 0;
		button {
			padding: 0.5rem;
		}
	}
`;
