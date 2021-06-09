import { createGlobalStyle } from "styled-components";
import chroma from "chroma-js";

const GlobalStyle = createGlobalStyle`
	:root{
		--disstreamchat-blue: #2d688d;
		--disstreamchat-purple: #462b45;
		--background-dark-gray: #17181b;
		--background-light-gray: #24252a;
		--background-transparent-gray: rgba(23, 24, 27, 0.631);
		--header-height: 134px;
		--youtube-background: linear-gradient(320.75deg, rgb(255, 0, 0) 8.4%, rgb(182, 0, 52) 100.11%);
		--twitch-background: linear-gradient(
			198.87deg,
			rgb(162, 58, 195) -17.84%,
			rgb(106, 69, 173) 114.96%
		);
	}


    html,
    body {
    	padding: 0;
        margin: 0;
		font-family: 'Poppins', sans-serif;
        /* overflow: hidden; */
		color: white;
		min-height: calc(100vh);
		/* border: 1px solid black; */
		/* background: #17181b88; */
		/* background: var(--background-light-gray); */
        box-sizing: border-box !important;
    }

	#__next{
		z-index: 1;
		button{
			font-family: 'Poppins',sans-serif;
		}
	}

	*[role="presentation"]{
		z-index: 1000000000000000 !important;
	}


    a {
    	color: inherit;
    	text-decoration: none;
		outline: none !important;
    }


    * {
    	box-sizing: border-box;
	}
	
	::-webkit-scrollbar {
		width: 1rem;
		border-radius: 100px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #24252a;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: var(--disstreamchat-blue);
		border-radius: 100px;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: ${chroma("#2d688d").darken(0.1).hex()}
	}

	.MuiFormHelperText-contained{
		margin-left: 0px !important;
	}
	
	#nprogress{
		z-index: 100000000000000000;
		.bar{
			z-index: 100000000000000000 !important;
		}
	}

	.MuiOutlinedInput-adornedStart {
		overflow: hidden !important;
	}

	.css-fac07y-container, .css-fac07y-container *{
		color: white !important;
	}

	hr{
		width: 100%;
	}

	.dragged {
		&, & * {
			z-index: 100;
		}
	}

	.placeholder {
		opacity: .5
	}
	.container-after-titlebar {
		overflow: hidden !important;
	}
	.add-button {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: .25rem;
		transition: background .25s;
		padding: .25rem;
		&:hover {
			background: #21212121;
		}
	}

	#chat-input--container {
		position: absolute;
		bottom: 10px;
		/* left: 50%; */
		width: 100vw;
	}

	.selected-item {
		background: #212121 !important;
	}

	.auto-fill-emote-image {
		max-width: 28px;
		min-width: 28px;
	}

	.auto-item {
		background: #121212;
		color: white;
		padding: .125rem 0.25rem;
		cursor: pointer;
		display: flex;
		&:hover,
		&:focus {
			background: #212121 !important;
		}
		img {
			margin-right: 0.25rem;
		}
	}

	.emote-item {
		padding: 0.125rem 0.25rem;
	}

	.rta {
		width: 100%;
		display: flex;
		position: relative;
	}

	.rta__autocomplete {
		position: absolute;
		transform: translateY(1rem);
		z-index: 1000000000;
		// max-height: 300px;
	}

	.chat-box {
		padding-bottom: 6rem !important;
	}

	button.compact {
		padding: .25rem .5rem;
	}
`;

export default GlobalStyle;
