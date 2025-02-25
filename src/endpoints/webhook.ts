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
        // const { clientId } = await getCredentials(read);
        // const response = await http.post(
        //     "https://oauth2.googleapis.com/token",
        //     {
        //         headers: {
        //             "Content-Type": "application/x-www-form-urlencoded",
        //         },
        //         data: `code=${request.query.code}&client_id=${clientId}&redirect_uri=http://localhost:3000//api/apps/public/d6588a9f-0f27-4e6e-8975-e6cc380f0cab/google-cloud-callback&&response_type=code&scope=${request.query.scope}`,
        //     },
        // );
        // console.log(response);
        return this.success("Authrized successfully");
    }
}
