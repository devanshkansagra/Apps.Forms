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
        const { code, state, error } = request.query;
        const accessToken = await this.app.oAuth2ClientInstance.getAccessTokenForUser(await read.getUserReader().getById(state));
        console.log(accessToken);
        return { status: 200, content: "Authorized successfully" };
    }
}
