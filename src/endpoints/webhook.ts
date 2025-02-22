// endpoint.ts
import {
    HttpStatusCode,
    IModify,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { SurveysApp } from "../../SurveysApp";

export class WebhookEndpoint extends ApiEndpoint {
    public path = "webhook";
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
    ): Promise<IApiResponse> {

        return this.success();
    }
}
