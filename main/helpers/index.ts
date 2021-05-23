export * from "./create-window";

export const isProd: boolean = process.env.NODE_ENV === "production";

export const baseUrl = (path="home") => {
	if (isProd) {
		return `app://./${path}.html`;
	} else {
		const port = process.argv[2];
		return `http://localhost:${port}/${path}`;
	}
};

