import { useEffect } from "react";
import { HeaderBody, IconSection } from "../../styles/header.styles";
import { useRouter } from "next/router";
import SettingsIcon from "@material-ui/icons/Settings";
import { ClearButton, PurpleButton } from "../../styles/button.styles";
const { ipcRenderer } = require("electron");

const Header = () => {
	const router = useRouter();

	const chatHeader = router.asPath.includes("chat");

	return (
		<HeaderBody>
			<IconSection>
				<PurpleButton>Sign out</PurpleButton>
				<ClearButton
					onClick={() => {
						ipcRenderer.send("open-settings");
					}}
				>
					<SettingsIcon />
				</ClearButton>
			</IconSection>
		</HeaderBody>
	);
};

export default Header;
