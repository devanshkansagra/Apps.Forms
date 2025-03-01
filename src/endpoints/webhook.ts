import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { getCredentials } from "../helpers/getCredentials";
import { OAuthURL } from "../enums/OAuthSettingEnum";
import { SDK } from "../lib/SDK";
import { SurveysApp } from "../../SurveysApp";
import { IAuthData } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";

export class WebhookEndpoint extends ApiEndpoint {
    public path = "google-cloud-callback";

    constructor(public readonly app: SurveysApp) {
        super(app);
    }
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const { code } = request.query;
        console.log(request);
        const sdk = this.app.sdk;
        let token: IAuthData = await sdk.getAccessToken(
            read,
            code,
            http,
            persis,
        );

        if (!token) {
            return { status: 400, content: "Unable to get Token" };
        }
        return { status: 200, content: "Authorized Successfully" };
    }
}
