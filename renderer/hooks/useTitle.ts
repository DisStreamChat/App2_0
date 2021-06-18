import { useContext, useEffect } from "react";
import { AppContext } from "../contexts/appContext";

export const useTitle = (postfix: string) => {
	const { titleBarRef } = useContext(AppContext);

	useEffect(() => {
		console.log(postfix)
		titleBarRef.current.updateTitle(`DisStreamChat - ${postfix}`);
	}, [titleBarRef]);
};
