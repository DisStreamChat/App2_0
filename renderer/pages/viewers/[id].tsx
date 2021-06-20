import { useRouter } from "next/router";

const Viewers = () => {
	const router = useRouter();

	console.log(router.query.id as string);

	return <></>;
};

export default Viewers;
