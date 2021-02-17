import React from "react";
import Head from "next/head";
import Link from "next/link";
const { ipcRenderer } = require("electron");

const Home = () => {
	return (
		<div>
			<p>
				⚡ Electron + Next.js ⚡ -
				<Link href="/next">
					<a>Go to next page</a>
				</Link>
				<button
					onClick={() => {
						ipcRenderer.send("open-settings");
					}}
				>
					open settings
				</button>
			</p>
			<img src="/images/logo.png" />
		</div>
	);
};

export async function getServerSideProps(ctx) {
	const { res } = ctx;
	res.writeHead(307, { location: "/channels" }).end();
	return { props: {} };
}

export default Home;
