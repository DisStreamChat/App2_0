import { useContext, useEffect } from "react";
import { AppContext } from "../contexts/appContext";

export const useTitle = (postfix: string) => {
	const { titleBarRef } = useContext(AppContext);

	useEffect(() => {
		console.log(titleBarRef.current);
		titleBarRef?.current?.updateTitle?.(`DisStreamChat - ${postfix}`);
	}, [titleBarRef, postfix]);
};
