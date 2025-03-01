import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { getCredentials } from "./getCredentials";
import { OAuthURL } from "../enums/OAuthSettingEnum";

export async function getAuthorizationURL(read: IRead) {
    const { clientId } = await getCredentials(read);

    const baseURL = OAuthURL.AUTH_URI;
    const redirectURL = OAuthURL.REDIRECT_URL
    const responseType = "code";

    const scope = [
        "email",
        "https://www.googleapis.com/auth/forms.body",
        "https://www.googleapis.com/auth/forms.body.readonly",
        "https://www.googleapis.com/auth/forms.responses.readonly"
    ].join(" ");
    const encodedScope = encodeURIComponent(scope);

    const accessType = "offline";
    const prompt = "consent";

    const url = `${baseURL}?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectURL}&` +
        `response_type=${responseType}&` +
        `scope=${encodedScope}&` +
        `access_type=${accessType}&` +
        `prompt=${prompt}`;

    return url;
}
