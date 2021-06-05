import { useState, useEffect, useContext, createContext } from "react";
import nookies, { parseCookies, destroyCookie } from "nookies";
import firebaseClient from "../firebase/client";
import { userModel } from "../models/user.model";

interface authType {
	user: userModel;
	isLoggedIn: boolean;
}

export const authContext = createContext<authType>(null);

export const AuthContextProvider = ({ children }) => {
	const [user, setUser] = useState<userModel>(null);

	useEffect(() => {
		return firebaseClient.auth.onAuthStateChanged(async (user: userModel) => {
			if(!user) return
			const userId = user?.uid;
			const userDbRef = firebaseClient.db.collection("Streamers").doc(userId);
			const userDbObject = await userDbRef.get();
			const userDbData = userDbObject.data();
			userDbData.savedChannels = userDbData.modChannels;
			setUser({ ...user, ...userDbData });
		});
	}, []);

	return <authContext.Provider value={{ user, isLoggedIn: !!user }}>{children}</authContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(authContext);
	if (!context) throw new Error("useAuth must be used within a auth context provider");
	return context;
};
