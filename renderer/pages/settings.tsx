import React from "react";
import Head from "next/head";
import Link from "next/link";

const Home = () => {
	return (
		<div>
			<p>
				⚡ Settings ⚡ -
				<Link href="/next">
					<a>Go to next page</a>
				</Link>
			</p>
			<img src="/images/logo.png" />
		</div>
	);
};

export default Home;
