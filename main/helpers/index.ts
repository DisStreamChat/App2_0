import createWindow from "./create-window";

const isProd: boolean = process.env.NODE_ENV === "production";

const baseUrl = (path="home") => {
	if (isProd) {
		return `app://./${path}.html`;
	} else {
		const port = process.argv[2];
		return `http://localhost:${port}/${path}`;
	}
};

export { createWindow, baseUrl };
