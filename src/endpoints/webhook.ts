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

export class WebhookEndpoint extends ApiEndpoint {
    public path = "google-cloud-callback";
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const { code, state, error } = request.query;
        const user = await read.getUserReader().getById(state);
        if (!user) {
            return {
                status: 404,
                content: "User not found",
            };
        }
        const sdk = new SDK(http);
        const response = await sdk.createToken(read, code, http, user, persis);
        if(response.statusCode !== 200) {
            return {
                status: response.statusCode,
                content: JSON.parse(response.content)
            }
        }
        return { status: 200, content: "Authorized successfully" };
    }
}
