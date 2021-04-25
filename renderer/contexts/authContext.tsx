import { useState, useEffect, useContext, createContext } from "react";
import nookies, {parseCookies, destroyCookie} from "nookies";
import firebaseClient from "../firebase/client";
import { userModel } from "../models/user.model";

interface authType {
	user: userModel;
	isLoggedIn: boolean
}

export const authContext = createContext<authType>(null);

export const AuthContextProvider = ({ children }) => {
	const [user, setUser] = useState<userModel>(null);

	useEffect(() => {
		const cookies = parseCookies()
		if(cookies["temp-token"]){
			const signInToken = cookies["temp-token"]
			firebaseClient.auth.signInWithCustomToken(signInToken)
			destroyCookie(null, "temp-token")
		}
	}, [])

	useEffect(() => {
		return firebaseClient.auth.onIdTokenChanged(async (user: userModel) => {
			if (!user) {
				setUser(null);
				destroyCookie(null, "auth-token")
				return;
			}
			const userId = user.uid
			const userDbRef = firebaseClient.db.collection("Streamers").doc(userId)
			const userDbObject = await userDbRef.get()
			const userDbData = userDbObject.data()
			userDbData.savedChannels = userDbData.modChannels
			setUser({...user, ...userDbData});
			
			const token = await user.getIdToken();
			nookies.set(undefined, "auth-token", token, {sameSite: "lax", path: "/"});
		});
	}, []);

	return <authContext.Provider value={{ user, isLoggedIn: !!user }}>{children}</authContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(authContext);
	if (!context) throw new Error("useAuth must be used within a auth context provider");
	return context;
};
